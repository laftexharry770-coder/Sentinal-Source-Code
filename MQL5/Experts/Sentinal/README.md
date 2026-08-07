# Sentinal — MT5 Expert Advisor

A trading harness for MetaTrader 5. Everything around a strategy is built and
working; the strategy itself is one function you fill in.

## Why this replaces the MetaApi work

MetaApi exists to reach an MT account from *outside* the terminal — that is what
a web dashboard needs. An Expert Advisor runs *inside* the terminal, so it reads
live prices, candle history and account state natively.

Nothing in this EA needs a MetaApi token, a deployed account, a region, or a
network round trip. The chart status panel reads terminal state directly, so it
reports what is actually true rather than what a cloud bridge last reported.

## Install

1. In MT5: **File → Open Data Folder**
2. Copy `Sentinal.mq5` into `MQL5/Experts/Sentinal/`
3. In MetaEditor (F4), open the file and press **F7** to compile
4. Back in MT5, refresh the Navigator and drag **Sentinal** onto a chart
5. On the Common tab, tick **Allow Algo Trading**, and make sure the toolbar
   **Algo Trading** button is green

The chart symbol and timeframe are the ones the EA trades — attach it to the
chart you want, e.g. XAUUSD M15.

## Status panel

Drawn top-left of the chart, refreshed each tick. `Sentinal:` shows one of:

| State | Meaning |
|---|---|
| `LIVE` | Connected, algo trading permitted, auto-trade on |
| `MONITOR ONLY` | Everything healthy, `InpAutoTrade` is `false` |
| `TRADING BLOCKED` | Algo trading disabled — terminal button, account, or EA settings |
| `DISCONNECTED` | No connection to the broker |
| `HALTED (target)` | `InpTargetProfit` reached; no new entries |

The remaining rows show server, login, DEMO/REAL, symbol and timeframe, bid/ask,
spread in pips, last tick time, open positions, and equity with running P/L.

## Inputs

**Trading** — `InpAutoTrade` (default `false`), `InpMagicNumber`,
`InpMaxPositions`.

**Risk** — `InpUseRiskPercent`, `InpRiskPercent`, `InpFixedLots`,
`InpStopLossPips`, `InpTakeProfitPips`.

**Filters** — `InpMaxSpreadPips`, `InpTargetProfit` (account profit at which new
entries stop; `0` disables).

**Display** — `InpShowPanel`, `InpPanelColor`.

Risk-based sizing converts your risk percentage into lots using the broker's
tick value and tick size, then clamps to the symbol's min/max/step. It requires
a stop loss — the EA refuses to initialise with `InpUseRiskPercent` on and
`InpStopLossPips` at `0`, because without a stop there is no defined risk to
size against.

## Adding your strategy

Fill in `Signal()`. It returns `SIGNAL_BUY`, `SIGNAL_SELL` or `SIGNAL_NONE`, and
currently always returns `SIGNAL_NONE` — so the EA will not trade on logic you
did not choose. Candle data needs no external API:

```mql5
MqlRates r[];
ArraySetAsSeries(r, true);
if(CopyRates(_Symbol, PERIOD_CURRENT, 0, 50, r) < 50)
   return(SIGNAL_NONE);
// r[1] is the last closed candle, r[2] the one before it.
```

`Signal()` is called on the first tick of each new bar, so it evaluates closed
candles rather than a forming one. Sizing, stop/target placement, broker minimum
stop distance, spread filtering, position limits and execution are all handled
around it.

## Before running on real money

Test in **Strategy Tester** first, then on a **demo** account. The panel labels
the account `[DEMO]` or `[REAL]` so you can tell at a glance which you are on.

`InpAutoTrade` defaults to `false` deliberately: attach it, watch the panel, and
only turn auto-trade on once the status reads as you expect. An EA with a live
`Signal()` places real orders at machine speed, and a stop loss is the only
thing bounding the loss on any one of them.
