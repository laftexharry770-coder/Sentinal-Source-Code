# Sentinal

A gold-trading bot in two halves that share one strategy.

| | | |
|---|---|---|
| **[`MQL5/Experts/Sentinal/`](MQL5/Experts/Sentinal/)** | MetaTrader 5 Expert Advisor | Runs on a PC or VPS, unattended |
| **[`mobile/`](mobile/)** | Phone web app | Connect, start, stop, monitor from anywhere |

Both trade **XAUUSD**, default to a martingale scalper restricted to the New
York session, and expose the same settings. Each folder has its own README with
install steps and full detail.

## Which half to use

They are complements, not alternatives.

**The EA is the always-on half.** It runs inside MetaTrader, so it has native
access to prices, candles and order execution — no API, no token, no network
round trip. It keeps trading while you sleep. This is the one to use for real
unattended trading.

**The mobile app is the pocket half.** A phone cannot speak MT5's protocol, so
it drives a cloud terminal through [MetaApi](https://app.metaapi.cloud). It
trades while the page is open, and phone browsers suspend backgrounded pages —
so treat it as a remote control and monitor that can also trade while you watch.

Positions opened by either keep their stop-loss and take-profit on the broker's
server, so closing the app never leaves a trade unprotected.

## Status

The EA compiles and trades. It has been run against a live Exness demo and
backtested over six months of XAUUSD M15 at 100% history quality: 111 trades,
profit factor 0.90, 13.73% maximum drawdown, longs winning 48.84% against shorts
at 27.94%. Those numbers describe an EMA-cross configuration, not the martingale
defaults now shipped — re-test before drawing conclusions about the current
setup.

## Before real money

`InpAutoTrade` in the EA and **START** in the app both default to off, so
installing neither is the act that starts trading an account.

Martingale is on by default and doubles position size after a loss, three times,
before resetting. It wins often and loses rarely but large. Run it in Strategy
Tester and on a demo account first, and size it against a balance that survives
a losing run — the backtest above recorded seven consecutive losses.
