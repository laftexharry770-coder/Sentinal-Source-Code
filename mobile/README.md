# Sentinal Mobile

A phone app for the same bot: sign in, watch the connection, toggle auto-trade,
see live price and candles. One file, no build step, no app store.

## Why it needs MetaApi

A phone cannot log into an MT5 account directly. MT5's trading protocol is
proprietary and there is no public API that accepts a broker login, password and
server from third-party code — only MetaQuotes' own app can do that.

So MetaApi runs a real MT5 terminal in the cloud, logged into your broker
account, and exposes it over HTTPS. This app talks to that. Your broker password
lives with MetaApi and never reaches this page.

## Sign in

Two values, both from [app.metaapi.cloud](https://app.metaapi.cloud):

| Field | Where |
|---|---|
| **API token** | API Access section |
| **Account ID** | Accounts page, the UUID next to your account |

The account must show **DEPLOYED** on MetaApi before anything can trade. If it
is not, the connection panel says so in those words and names the actual state.

## Running it

**On your phone**, open `index.html` from any HTTPS URL. GitHub Pages, Netlify
drop, or any static host works — it is a single file with no dependencies. In
Safari or Chrome use *Add to Home Screen* and it behaves like an installed app.

It will not work from `file://` on a phone — the browser blocks the network
requests. It needs to be served over HTTPS.

## The limitation you must plan around

**This page only trades while it is open and on screen.**

Phone browsers suspend background tabs within seconds of you switching away.
When that happens the loop stops: no new entries, no trailing, no recovery
steps. Positions already open keep their stop-loss and take-profit because those
live on the broker's server, so nothing is left unprotected — but the bot is not
running.

For unattended trading, use the MT5 Expert Advisor in `MQL5/Experts/Sentinal/`
on a PC or a VPS. That is what an always-on setup looks like. This app is best
understood as a remote control and monitor that can also trade while you watch.

## What it does

**Connection panel** — MetaApi state (`DEPLOYED` or the real value), broker
connection status, region, account login, balance, equity, open positions. Every
failure prints the exact HTTP status and response body rather than a generic
message.

**Auto-trade toggle** — off on load. When off, everything updates but no orders
are sent. When on, the status line names what it is waiting for, or why it is
idle: outside the New York session, position limit reached, spread too wide,
account not deployed.

**Market** — live bid/ask, spread in points against your limit, session state,
and a candlestick chart drawn from MetaApi's historical data.

**Settings** — symbol, timeframe, initial lot, max positions, dollar stop and
target, martingale multiplier and recovery depth, daily profit target, max total
loss, New York session window, spread cap. Saved to the device.

## Differences from the EA

- **Session hours are UTC here**, not broker server time. The New York session is
  roughly 13:00–22:00 UTC, which is the default. The EA uses server time because
  MQL5 has no reliable UTC clock; this app does.
- **Signals are evaluated on the latest candle** MetaApi returns, polled every
  five seconds, so entries are close to but not identical with the EA's timing.
- **No ATR mode.** This app runs the dollar-stop and martingale path only. For
  volatility-scaled stops and percent-of-balance sizing, use the EA.
- **Entries are capped at one per candle**, same as the EA.

## Security

The MetaApi token is stored in the browser's `localStorage` on your device so
you do not retype it. Anyone with the unlocked phone can read it. Use a
**read-only token** unless you are actively trading, and revoke it in the MetaApi
dashboard if the device is lost. Sign out clears the stored token.
