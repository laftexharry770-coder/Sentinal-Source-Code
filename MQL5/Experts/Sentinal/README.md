# Sentinal — trend-adaptive MT5 Expert Advisor

A trading bot for MetaTrader 5, with defaults tuned for **XAUUSD**. It reads the
higher-timeframe trend, sizes every position from live volatility, trails its
stop as a trade moves, and exits when the trend turns against it.

## Why this replaces the MetaApi work

MetaApi exists to reach an MT account from *outside* the terminal — what a web
dashboard needs. An EA runs *inside* it, so live prices, candle history, account
state and order execution are all native.

No API token, no deployed account, no region, no backend functions, no network
round trip. The status panel reads terminal state directly, so it reports what
is actually true.

## Points, not pips — and why gold broke before

Every distance in this EA is in **points**: the smallest quote increment for the
symbol.

Gold is quoted at **2 or 3 digits depending on the broker**, so a point is not a
fixed amount of money:

| Broker quote | Example | 1 point | A 26-cent spread reads as |
|---|---|---|---|
| 2-digit | `4345.36` | `0.01` | 26 points |
| 3-digit | `4345.368` | `0.001` | **260 points** |

Exness quotes `XAUUSDm` at 3 digits. This is why `InpMaxSpreadPoints` defaults to
`500` and why `InpMaxSpreadATR` exists — an ATR-relative spread limit means the
same thing on every broker, where an absolute point limit does not.

Version 1 used "pips" and computed them as `10 × point` only on 5- and 3-digit
symbols. Gold quotes at 2 digits, so it fell through to 1 pip = 1 point = `0.01`
— meaning a "30 pip" stop was **30 cents on gold**, far inside any broker's
minimum stop distance. Every order would have been rejected by the pre-trade
check, and the bot would have run without ever placing a trade.

Points remove the ambiguity, and ATR-based stops remove the guesswork.

## Install

1. In MT5: **File → Open Data Folder**
2. Copy `Sentinal.mq5` into `MQL5/Experts/Sentinal/`
3. In MetaEditor (F4), open it and press **F7** to compile
4. Refresh the Navigator, drag **Sentinal** onto an **XAUUSD** chart (M15 is a
   reasonable starting timeframe)
5. On the Common tab tick **Allow Algo Trading**, and make sure the toolbar
   **Algo Trading** button is green

The chart's symbol and timeframe are what it trades.

## Turning it on

Two switches, both off by default:

1. MT5's **Algo Trading** toolbar button green
2. **`InpAutoTrade` → `true`**

With `InpAutoTrade` off it evaluates everything and updates the panel but sends
no orders. That is deliberate: attaching the EA is never itself the thing that
starts trading your account.

## How it adapts to the trend

Three mechanisms, all live:

**Direction gate.** `TrendDirection()` compares price to a 200 EMA on a higher
timeframe (`InpTrendTF`, default H1) while the chart runs on a lower one. An
entry signal is only taken if it agrees with that direction — a buy signal in a
downtrend is discarded.

**Strength gate.** ADX measures how *strongly* a market is trending, not which
way. Below `InpADXMin` (default 20) the market is ranging, where trend-following
entries bleed, and no trade is taken at all.

**Reversal exit.** With `InpCloseOnReverse`, an open position is closed as soon
as the higher-timeframe trend flips against it, rather than sitting through the
move waiting for the stop.

Trend and ADX are re-evaluated every tick, not once per bar, so reversal exits
and trailing stops do not wait for a candle to close. Entries are still gated to
new bars so signals read closed candles.

## How it adapts to volatility

With `InpUseATRStops` (default on), stop and target are `ATR × multiplier`
rather than fixed distances. Gold's range varies enormously between the Asian
session and a CPI release; a fixed 3000-point stop is too wide in one and too
tight in the other. ATR rescales automatically.

Position size is then derived from that *actual* stop distance, so a wider
volatility-driven stop produces a smaller position and the money at risk stays
at `InpRiskPercent` either way.

`InpUseTrailingStop` trails the stop at `ATR × InpATRTrailMult` behind price,
tightening only — it can reduce risk on a trade but never widen it.

## Everything scales to the live balance

No setting is a fixed cash amount. Every limit is a percentage of the balance
read at the moment it is evaluated, so the same configuration stays correct as
the account grows, and tightens automatically in drawdown.

| Input | Meaning |
|---|---|
| `InpRiskPercent` | Target risk per trade. Position size is derived from this and the actual stop distance |
| `InpMaxRiskPercent` | Hard ceiling per trade. Only relevant when the broker minimum lot risks more than the target |
| `InpMaxTotalRiskPct` | Cap on combined risk across all open positions |
| `InpMaxDailyLossPct` | Stops new entries for the rest of the day past this loss, rebased each day |
| `InpTargetProfitPct` | Halts new entries at this gain, as a percentage rather than a dollar figure |

### The minimum-lot problem, solved proportionally

On a small account the broker's minimum lot can risk more than your target. A
$1,000 balance trading gold with a 2×ATR stop needs roughly 0.006 lots to risk
1% — but the minimum tradeable size is 0.01.

Rather than refusing (no trades ever) or blindly accepting (unbounded risk), the
EA computes what the minimum lot would actually risk as a percentage of the
*current* balance, and takes it only if that is within `InpMaxRiskPercent`. So:

- **Small balance** — minimum lot might risk 4%, taken only if the ceiling
  allows, and logged with the real number every time
- **Growing balance** — the same trade becomes 2%, then 1%, then the constraint
  disappears entirely and normal risk-based sizing takes over
- **Drawdown** — the percentage rises automatically, and entries stop once it
  crosses the ceiling, without you changing a setting

The panel shows this live: `Risk: 1.0% target | min lot 4.41% | ceiling 5.0%`,
turning red with `(NO TRADES)` when the minimum lot is unaffordable at the
current balance and volatility. That row is the single best predictor of whether
a signal will become a trade.

## Strategies

| `InpStrategy` | Buy | Sell |
|---|---|---|
| `STRAT_EMA_CROSS` | Fast EMA crosses above slow | Fast crosses below slow |
| `STRAT_RSI_REVERSION` | RSI climbs back above oversold | RSI drops back below overbought |
| `STRAT_BREAKOUT` | Close above prior N-bar high | Close below prior N-bar low |

All read closed candles only. The breakout range spans bars 2..N+1, excluding
the candle that just closed, so that candle's close is tested against a range it
did not help form.

These are standard textbook entries — a tunable starting point, not an edge.

## Status panel

| State | Meaning |
|---|---|
| `LIVE` | Connected, algo trading permitted, auto-trade on |
| `MONITOR ONLY` | Healthy, `InpAutoTrade` is `false` |
| `MARKET CLOSED` | Symbol not currently tradeable (gold's daily break) |
| `TRADING BLOCKED` | Algo trading disabled somewhere |
| `DISCONNECTED` | No broker connection |
| `HALTED (target)` | `InpTargetProfit` reached; no new entries |

Plus server, login with `[DEMO]`/`[REAL]`, symbol and timeframe, strategy,
**live trend direction**, bid/ask, spread in points, **current ATR in points**,
open positions, and equity with running P/L.

## Trading around the clock

Gold trades roughly 23 hours a day. `InpUseTimeFilter` defaults to **off**, so
the EA is active whenever the market is. `MarketOpen()` checks the symbol's
trade mode and requires a valid two-sided tick, so the daily break shows as
`MARKET CLOSED` rather than producing failed orders.

`InpMaxSpreadPoints` (default 50) blocks entries while the spread is abnormally
wide — which on gold is exactly the rollover window and the first seconds after
high-impact news.

## Fixes in v2

- **Gold pip bug** — points throughout; the old formula made stops ~10× too
  tight on XAUUSD and would have blocked every order
- **Stops now widen** to the broker's minimum distance instead of the trade
  being skipped, and account for the spread (a stop inside the spread is hit
  the moment it is placed)
- **Margin check** via `OrderCalcMargin` before ordering, instead of letting
  the broker reject it
- **Min-lot risk guard** — if the broker's minimum lot would risk more than
  `InpRiskPercent`, the trade is skipped and logged rather than silently
  exceeding your risk setting. `InpAllowMinLot` overrides
- **`IsNewBar()`** is seeded in `OnInit`, so attaching mid-candle no longer
  counts as a new bar and fires an immediate entry on stale conditions
- **Trailing stop** only ever tightens, symmetrically for buys and sells
- **Freeze level** honoured alongside stop level
- Per-strategy input validation with clear messages in the Experts tab

## Before real money

Run **Strategy Tester** first, then **demo**. The panel tags the account
`[DEMO]` or `[REAL]` so it is never ambiguous which you are on.

Risk defaults to 1% per trade with an ATR-scaled stop, which is survivable
through a losing run. The EA will not start with risk-based sizing and no stop,
because without a stop there is no defined risk to size against.
