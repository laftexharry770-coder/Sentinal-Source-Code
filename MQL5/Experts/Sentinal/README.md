# Sentinal — MT5 Expert Advisor

A trading bot for MetaTrader 5, tuned for **XAUUSD on H1**.

Out of the box it runs as a **martingale scalper**: fixed dollar stop and target
per trade, a capped recovery ladder after losses, entries restricted to the New
York session, and immediate intrabar execution.

## Defaults on attach

| Setting | Value |
|---|---|
| Stop loss per trade | $2.00 |
| Take profit per trade | $1.00 |
| Initial lot | 0.01 (minimum) |
| Martingale multiplier | 2.0 |
| Maximum recovery attempts | 3 |
| Loss to trigger recovery | $0.50 |
| Maximum simultaneous positions | 5 |
| Daily profit target | $100 |
| Max total loss | 50% of balance |
| Session | New York only |
| Execution | Intrabar — fires the moment a signal appears |

**The Inputs dialog shows exactly nine settings** — Trade Settings, Martingale
Settings, Session — matching the AXIOM layout. Everything else (magic number,
max positions, daily target, loss cap, spread filter, balance scaling, EMA
periods) is fixed inside the EA at the values above.

**The on/off switch is MT5's own "Allow Algo Trading" checkbox** on the Common
tab, plus the toolbar Algo Trading button — the same as the reference EA. Attach
with the box unticked and it monitors; tick it and it trades. There is no
separate auto-trade input any more.

The New York session is defined in **GMT (13:00–22:00)** and checked against
`TimeGMT()`, so it is correct on any broker without calibration. The panel's
Time row shows your local clock with the window translated into it — in Nairobi
that reads `NY 16:00-01:00`. (The Strategy Tester approximates GMT from server
time, so backtests can sit a couple of hours off; live trading is exact.)

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

## Martingale mode

`InpUseMartingale` reproduces the recovery scheme used by AXIOM-style scalpers.
It is **off by default**. Read this before switching it on.

**How it works.** After a closing deal loses more than `InpLossTriggerUSD`, the
next position is multiplied by `InpMartingaleMult`, up to `InpMaxRecovery`
escalations. Any winning deal resets the ladder to `InpInitialLot`.

At the defaults (0.01 base, ×2.0, 3 attempts) the sequence is:

| Step | Lot | Cumulative staked |
|---|---|---|
| 0 | 0.01 | 0.01 |
| 1 | 0.02 | 0.03 |
| 2 | 0.04 | 0.07 |
| 3 | 0.08 | 0.15 |

**Why it looks flawless.** With `InpTakeProfitUSD` well below
`InpStopLossUSD`, most trades win. The equity curve climbs in small steady
steps, and the doubling means a single win recovers the whole preceding losing
run. Screen recordings of martingale bots look extraordinary for exactly this
reason — you are watching the good part of the cycle.

**What it costs.** The scheme risks $2 to make $1 at the default settings, so
it needs roughly a **67% win rate just to break even** before any doubling. The
losses are not avoided, they are deferred and concentrated: four consecutive
losses put 0.15 lots through the ladder and then reset, having lost every step.
Capping recovery at 3 is what "safer" means here — it bounds the size of the
disaster, it does not prevent it.

**Guards that apply in this mode:** `InpMaxLossPctBal` halts everything once
equity is down that percentage from the balance at attach, and
`InpDailyProfitUSD` stops for the day once hit. `MarginSufficient()` still
rejects any escalation the account cannot cover. The panel shows a live
`Recovery: step N / M   next lot X` row, red whenever the ladder is active.

## New York session

`InpNewYorkOnly` restricts entries to `InpNYStartHour`–`InpNYEndHour`, which are
**server time, not your local time**. Broker servers commonly run GMT+2 or GMT+3,
so the New York session (roughly 13:00–22:00 UTC) usually lands around 15:00–24:00
server time — the default.

Calibrate rather than assume: the panel prints the live server clock and whether
the session is open, so compare it against a known New York time once and adjust
the two hours. A window that wraps past midnight is handled.

## Bar-close vs intrabar entries

`InpIntrabarSignals` decides which candle the rules read.

**`false` (default) — bar close.** Rules read candle 1, the last *closed* one.
A signal here is settled: it cannot be taken back. Entry happens on the first
tick after the candle closes, so on an M15 chart the bot can wait up to 15
minutes before acting on a move.

**`true` — intrabar.** Rules read candle 0, the one currently forming, and every
tick is a chance to enter. Reaction is immediate.

The cost is real and worth understanding. On a forming candle an EMA cross can
appear, then vanish before the candle closes, because the current price is still
moving. The bot will have already traded on a signal that, in hindsight, never
happened — the chart afterwards shows no cross at all. Whipsaw in a choppy
market is the usual outcome.

Two consequences:

- Entries are capped at **one per candle**, so a value flickering across a
  threshold cannot fire repeated orders.
- **Backtests become unreliable as a guide.** The Strategy Tester models
  intrabar ticks approximately, so a backtest with this on will not match live
  results the way a bar-close test does. Numbers you gathered at bar close do
  not transfer.

Reversal exits and trailing stops already run every tick in both modes — that
part was never waiting for a candle.

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

## Why the ladder distances are pinned to the initial lot

Stop, target and trail distances are all derived from `InpInitialLot`, never
from the escalated lot.

Derive them from the current lot and the martingale cancels itself out exactly.
Doubling the lot halves the price distance needed for the same dollar amount, so
at recovery step 3 a win pays one unit of target while three losses cost three
units of stop — the recovery can never recover. Pinning the distances means 0.08
lots reaching the same target pays 8 × $1 = $8, covering the $6 lost getting
there.

The consequence is that **money at risk escalates with the ladder**, which is
what a martingale is:

| Step | Lot | Risk | Cumulative |
|---|---|---|---|
| 0 | 0.01 | $2 | $2 |
| 1 | 0.02 | $4 | $6 |
| 2 | 0.04 | $8 | $14 |
| 3 | 0.08 | $16 | $30 |

The panel's `Risk` row prints both the next entry's exposure and the full
ladder's, as cash and as a share of balance, and flags `OVER CAP` when the
ladder exceeds `InpMaxLossPctBal`.

## Scaling to the account balance

`$2` and `0.01` are not amounts, they are a shape: on a $1,000 account they mean
*risk 0.2% to make 0.1% at the broker minimum lot*. Left fixed, that shape decays
— the same $2 is 0.04% of a $5,000 account, and the bot would be trading pocket
change while the balance grew.

`InpScaleToBalance` (default on) multiplies the **lot** by
`balance / InpRefBalance`, read live on every entry. `InpRefBalance` says which
balance the dollar settings were written for — $1,000 by default.

The price distances are deliberately *not* scaled. They come from the unscaled
reference pair, so the stop and target sit exactly where they always did and the
bot keeps trading the same shape of move. Only the size behind them changes.

| Balance | Factor | Base lot | Full ladder | % of balance |
|---|---|---|---|---|
| $200 | ×0.20 | 0.01 | $30 | 15.0% |
| $500 | ×0.50 | 0.01 | $30 | 6.0% |
| $1,013 | ×1.01 | 0.01 | $30 | 3.0% |
| $2,500 | ×2.50 | 0.02 | $60 | 2.4% |
| $10,000 | ×10.0 | 0.10 | $300 | 3.0% |
| $50,000 | ×50.0 | 0.49 | $1,470 | 2.9% |

Above the reference the exposure holds at roughly 3% of balance per full failed
ladder, growing in cash and staying flat in percentage — which is the point.

**Below the reference it cannot.** The broker's 0.01 minimum lot is a hard
floor, so a $500 account risks 6% per ladder and a $200 account risks 15%, no
matter what the settings say. That is arithmetic, not a setting to fix. The
panel's `Scale` row shows the factor and the base lot and marks it
`(at broker minimum)` whenever the floor is what is binding:

```
Scale:  x1.01  base lot 0.01
Scale:  x0.20  base lot 0.01  (at broker minimum)
```

`InpLossTriggerUSD` and `InpDailyProfitUSD` scale the same way, so the recovery
trigger and the daily stop keep their meaning as the account grows. Percentage
limits — `InpMaxLossPctBal`, `InpMaxDailyLossPct` — were already proportional
and are unchanged.
