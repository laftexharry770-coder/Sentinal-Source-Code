# Sentinal Trader — mobile

Connect a broker account, press START, press STOP. Three tabs: Home, MetaTrader,
Settings. One HTML file, no build step, no app store.

## Why it needs MetaApi

A phone cannot log into an MT5 account directly. MT5's trading protocol is
proprietary and there is no public API that accepts a broker login from
third-party code — only MetaQuotes' own app can do that.

MetaApi solves it by provisioning a real MT5 terminal in the cloud from your
broker credentials and exposing it over HTTPS. This app sends your broker login
straight to MetaApi and drives the terminal from there.

## First run

**Settings → MetaApi service key.** Paste a token from
[app.metaapi.cloud](https://app.metaapi.cloud) → API Access. Once, on this
device.

Commercial apps of this kind keep that key on their own server, so their users
only ever see broker fields. Without a backend of your own, the key lives here
instead. Everything after this step matches.

**MetaTrader → Connect MT Account.** Two ways in, chosen with the toggle at the
top of the card.

**MetaApi account ID** — if you already provisioned an account at
app.metaapi.cloud, paste its UUID from the Accounts page. That account already
holds your broker login, so nothing else is needed. If it is not deployed, the
app deploys it. This is the shorter path and avoids creating a duplicate cloud
account you would be billed for.

**Broker login** — pick your broker, pick or type the exact server name, enter
your login ID and password, tap **CONNECT ACCOUNT**. Use this when no MetaApi
account exists yet; it provisions one.

The app then creates the cloud account, deploys it, and waits for the broker to
accept the login — reporting each stage as it happens. When the broker connects,
the screen becomes **Account Connected** with Update and Disconnect.

The server string has to match exactly what MT5 shows under
*File → Open an Account* — `Exness-MT5Trial9`, `JustMarkets-MT5-Demo-3`. A wrong
server is the most common failure, and the error names it rather than hanging.

## Running the bot

**Home → START.** The card flips to **RUNNING** and the status line below it
says what the bot is doing: armed and watching, or idle with the reason —
outside the New York session, position limit reached, spread too wide, account
not deployed. **STOP** halts new entries immediately.

Home also shows balance, equity, running P/L, open positions, the live recovery
step, bid/ask, spread against your cap, session state, and a candlestick chart.

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

## Settings

Symbol, timeframe, initial lot, max positions, dollar stop and target,
martingale multiplier and recovery depth, loss-to-recover trigger, daily profit
target, max total loss, New York session window, spread cap. Saved to the
device.

The martingale panel previews the actual ladder — `0.01 → 0.02 → 0.04 → 0.08`
— so the escalation is visible before it happens rather than after.

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
