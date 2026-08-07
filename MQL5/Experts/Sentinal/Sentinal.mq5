//+------------------------------------------------------------------+
//|                                                     Sentinal.mq5 |
//|                          Expert Advisor - trading harness for MT5 |
//+------------------------------------------------------------------+
#property copyright "Sentinal"
#property version   "1.00"
#property strict
#property description "Sentinal trading bot: on-chart status panel, risk-based"
#property description "position sizing, and selectable EMA / RSI / breakout entries."

#include <Trade/Trade.mqh>
#include <Trade/PositionInfo.mqh>
#include <Trade/SymbolInfo.mqh>

//+------------------------------------------------------------------+
//| Strategy selection                                                |
//|                                                                   |
//| These are standard, transparent textbook entries. They are a      |
//| working starting point you can tune and test - not an edge, and   |
//| not a claim that any of them is profitable on your symbol.        |
//+------------------------------------------------------------------+
enum EStrategy
  {
   STRAT_EMA_CROSS,      // EMA cross (fast crosses slow)
   STRAT_RSI_REVERSION,  // RSI reversion (exit from oversold/overbought)
   STRAT_BREAKOUT        // Breakout of N-bar high/low
  };

//+------------------------------------------------------------------+
//| Inputs                                                           |
//+------------------------------------------------------------------+
input group "=== Strategy ==="
input EStrategy InpStrategy      = STRAT_EMA_CROSS; // Entry strategy
input int    InpFastEMA        = 12;      // EMA cross: fast period
input int    InpSlowEMA        = 26;      // EMA cross: slow period
input int    InpRSIPeriod      = 14;      // RSI: period
input int    InpRSIOversold    = 30;      // RSI: oversold level
input int    InpRSIOverbought  = 70;      // RSI: overbought level
input int    InpBreakoutBars   = 20;      // Breakout: lookback bars

input group "=== Trading ==="
input bool   InpAutoTrade      = false;   // Auto-trade (false = monitor only)
input long   InpMagicNumber    = 770001;  // Magic number
input int    InpMaxPositions   = 1;       // Max simultaneous positions

input group "=== Risk ==="
input bool   InpUseRiskPercent = true;    // Size by risk % (false = fixed lots)
input double InpRiskPercent    = 1.0;     // Risk per trade (% of balance)
input double InpFixedLots      = 0.01;    // Fixed lot size
input int    InpStopLossPips   = 30;      // Stop loss (pips, 0 = none)
input int    InpTakeProfitPips = 60;      // Take profit (pips, 0 = none)

input group "=== Filters ==="
input double InpMaxSpreadPips  = 3.0;     // Max spread (pips, 0 = ignore)
input double InpTargetProfit   = 0.0;     // Halt at account profit (0 = off)

input group "=== Display ==="
input bool   InpShowPanel      = true;    // Show status panel
input color  InpPanelColor     = clrWhite;// Panel text colour

//+------------------------------------------------------------------+
//| Globals                                                          |
//+------------------------------------------------------------------+
CTrade         trade;
CPositionInfo  position;

double g_pip           = 0.0;   // price value of one pip
double g_startBalance  = 0.0;   // balance at attach, for TargetProfit
bool   g_halted        = false; // latched once TargetProfit is hit

int    g_hFast         = INVALID_HANDLE; // fast EMA handle
int    g_hSlow         = INVALID_HANDLE; // slow EMA handle
int    g_hRSI          = INVALID_HANDLE; // RSI handle

const string PANEL_PREFIX = "SENT_";

enum ESignal { SIGNAL_NONE = 0, SIGNAL_BUY = 1, SIGNAL_SELL = -1 };

//+------------------------------------------------------------------+
//| Initialisation                                                   |
//+------------------------------------------------------------------+
int OnInit()
  {
   trade.SetExpertMagicNumber(InpMagicNumber);
   trade.SetTypeFillingBySymbol(_Symbol);
   trade.SetDeviationInPoints(20);

   // A "pip" is 10 points on 5- and 3-digit quotes, 1 point otherwise.
   g_pip = (_Digits == 5 || _Digits == 3) ? 10 * _Point : _Point;

   g_startBalance = AccountInfoDouble(ACCOUNT_BALANCE);
   g_halted       = false;

   if(InpUseRiskPercent && InpRiskPercent <= 0.0)
     {
      Print("Sentinal: InpRiskPercent must be > 0 when sizing by risk.");
      return(INIT_PARAMETERS_INCORRECT);
     }
   if(!InpUseRiskPercent && InpFixedLots <= 0.0)
     {
      Print("Sentinal: InpFixedLots must be > 0 when using fixed lots.");
      return(INIT_PARAMETERS_INCORRECT);
     }
   if(InpUseRiskPercent && InpStopLossPips <= 0)
     {
      Print("Sentinal: risk-based sizing needs a stop loss. Set InpStopLossPips > 0.");
      return(INIT_PARAMETERS_INCORRECT);
     }

   if(!CreateIndicators())
      return(INIT_FAILED);

   if(InpShowPanel)
      PanelUpdate();

   Print("Sentinal initialised on ", _Symbol,
         " | strategy=", EnumToString(InpStrategy),
         " | auto-trade=", (InpAutoTrade ? "ON" : "OFF"),
         " | digits=", _Digits, " | pip=", DoubleToString(g_pip, _Digits));

   return(INIT_SUCCEEDED);
  }

//+------------------------------------------------------------------+
//| Shutdown                                                         |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
  {
   if(g_hFast != INVALID_HANDLE) IndicatorRelease(g_hFast);
   if(g_hSlow != INVALID_HANDLE) IndicatorRelease(g_hSlow);
   if(g_hRSI  != INVALID_HANDLE) IndicatorRelease(g_hRSI);

   ObjectsDeleteAll(0, PANEL_PREFIX);
   ChartRedraw();
  }

//+------------------------------------------------------------------+
//| Build the indicator handles the selected strategy needs          |
//+------------------------------------------------------------------+
bool CreateIndicators()
  {
   switch(InpStrategy)
     {
      case STRAT_EMA_CROSS:
        {
         if(InpFastEMA < 1 || InpSlowEMA < 1)
           {
            Print("Sentinal: EMA periods must be >= 1.");
            return(false);
           }
         if(InpFastEMA >= InpSlowEMA)
           {
            Print("Sentinal: InpFastEMA must be smaller than InpSlowEMA.");
            return(false);
           }
         g_hFast = iMA(_Symbol, PERIOD_CURRENT, InpFastEMA, 0, MODE_EMA, PRICE_CLOSE);
         g_hSlow = iMA(_Symbol, PERIOD_CURRENT, InpSlowEMA, 0, MODE_EMA, PRICE_CLOSE);
         if(g_hFast == INVALID_HANDLE || g_hSlow == INVALID_HANDLE)
           {
            Print("Sentinal: failed to create EMA handles. err=", GetLastError());
            return(false);
           }
         break;
        }

      case STRAT_RSI_REVERSION:
        {
         if(InpRSIPeriod < 2)
           {
            Print("Sentinal: InpRSIPeriod must be >= 2.");
            return(false);
           }
         if(InpRSIOversold <= 0 || InpRSIOverbought >= 100 ||
            InpRSIOversold >= InpRSIOverbought)
           {
            Print("Sentinal: need 0 < oversold < overbought < 100.");
            return(false);
           }
         g_hRSI = iRSI(_Symbol, PERIOD_CURRENT, InpRSIPeriod, PRICE_CLOSE);
         if(g_hRSI == INVALID_HANDLE)
           {
            Print("Sentinal: failed to create RSI handle. err=", GetLastError());
            return(false);
           }
         break;
        }

      case STRAT_BREAKOUT:
        {
         if(InpBreakoutBars < 2)
           {
            Print("Sentinal: InpBreakoutBars must be >= 2.");
            return(false);
           }
         break;   // uses raw price data, no indicator handle needed
        }
     }

   return(true);
  }

//+------------------------------------------------------------------+
//| Tick                                                             |
//+------------------------------------------------------------------+
void OnTick()
  {
   if(InpShowPanel)
      PanelUpdate();

   if(!TradingReady())
      return;

   // Account-level profit target: latch off once reached.
   if(InpTargetProfit > 0.0 && !g_halted)
     {
      double profit = AccountInfoDouble(ACCOUNT_EQUITY) - g_startBalance;
      if(profit >= InpTargetProfit)
        {
         g_halted = true;
         Print("Sentinal: target profit ", DoubleToString(InpTargetProfit, 2),
               " reached (", DoubleToString(profit, 2), "). Halting new entries.");
        }
     }
   if(g_halted)
      return;

   if(!InpAutoTrade)
      return;                       // monitor-only mode

   if(OpenPositionCount() >= InpMaxPositions)
      return;

   if(!SpreadAcceptable())
      return;

   // Act only on the first tick of a new bar, so signals are evaluated
   // against closed candles rather than a forming one.
   if(!IsNewBar())
      return;

   ESignal signal = Signal();
   if(signal == SIGNAL_BUY)
      OpenTrade(ORDER_TYPE_BUY);
   else if(signal == SIGNAL_SELL)
      OpenTrade(ORDER_TYPE_SELL);
  }

//+------------------------------------------------------------------+
//| Signal — dispatches to the selected strategy.                    |
//|                                                                  |
//| Called on the first tick of a new bar, so every rule below is    |
//| evaluated against CLOSED candles. Bar 1 is the candle that just  |
//| closed; bar 0 is still forming and is never used for entries.    |
//+------------------------------------------------------------------+
ESignal Signal()
  {
   switch(InpStrategy)
     {
      case STRAT_EMA_CROSS:     return(SignalEmaCross());
      case STRAT_RSI_REVERSION: return(SignalRsiReversion());
      case STRAT_BREAKOUT:      return(SignalBreakout());
     }
   return(SIGNAL_NONE);
  }

//+------------------------------------------------------------------+
//| Fast EMA crossing the slow EMA                                   |
//+------------------------------------------------------------------+
ESignal SignalEmaCross()
  {
   double fast[], slow[];
   ArraySetAsSeries(fast, true);
   ArraySetAsSeries(slow, true);

   // Two most recently closed bars: [0] = bar 1, [1] = bar 2.
   if(CopyBuffer(g_hFast, 0, 1, 2, fast) < 2) return(SIGNAL_NONE);
   if(CopyBuffer(g_hSlow, 0, 1, 2, slow) < 2) return(SIGNAL_NONE);

   bool crossedUp   = (fast[1] <= slow[1] && fast[0] >  slow[0]);
   bool crossedDown = (fast[1] >= slow[1] && fast[0] <  slow[0]);

   if(crossedUp)   return(SIGNAL_BUY);
   if(crossedDown) return(SIGNAL_SELL);
   return(SIGNAL_NONE);
  }

//+------------------------------------------------------------------+
//| RSI leaving an oversold / overbought zone                        |
//+------------------------------------------------------------------+
ESignal SignalRsiReversion()
  {
   double rsi[];
   ArraySetAsSeries(rsi, true);

   if(CopyBuffer(g_hRSI, 0, 1, 2, rsi) < 2) return(SIGNAL_NONE);

   bool leftOversold   = (rsi[1] <  InpRSIOversold   && rsi[0] >= InpRSIOversold);
   bool leftOverbought = (rsi[1] >  InpRSIOverbought && rsi[0] <= InpRSIOverbought);

   if(leftOversold)   return(SIGNAL_BUY);
   if(leftOverbought) return(SIGNAL_SELL);
   return(SIGNAL_NONE);
  }

//+------------------------------------------------------------------+
//| Close beyond the high / low of the preceding N bars              |
//+------------------------------------------------------------------+
ESignal SignalBreakout()
  {
   MqlRates r[];
   ArraySetAsSeries(r, true);

   int need = InpBreakoutBars + 2;
   if(CopyRates(_Symbol, PERIOD_CURRENT, 0, need, r) < need)
      return(SIGNAL_NONE);

   // Range spans bars 2..N+1 — it excludes the bar that just closed, so
   // that bar's close is tested against a range it did not help form.
   double hi = r[2].high;
   double lo = r[2].low;
   for(int i = 3; i <= InpBreakoutBars + 1; i++)
     {
      hi = MathMax(hi, r[i].high);
      lo = MathMin(lo, r[i].low);
     }

   if(r[1].close > hi) return(SIGNAL_BUY);
   if(r[1].close < lo) return(SIGNAL_SELL);
   return(SIGNAL_NONE);
  }

//+------------------------------------------------------------------+
//| Order execution                                                  |
//+------------------------------------------------------------------+
void OpenTrade(const ENUM_ORDER_TYPE type)
  {
   double price = (type == ORDER_TYPE_BUY)
                  ? SymbolInfoDouble(_Symbol, SYMBOL_ASK)
                  : SymbolInfoDouble(_Symbol, SYMBOL_BID);
   if(price <= 0.0)
      return;

   double sl = 0.0, tp = 0.0;
   if(InpStopLossPips > 0)
      sl = (type == ORDER_TYPE_BUY) ? price - InpStopLossPips * g_pip
                                    : price + InpStopLossPips * g_pip;
   if(InpTakeProfitPips > 0)
      tp = (type == ORDER_TYPE_BUY) ? price + InpTakeProfitPips * g_pip
                                    : price - InpTakeProfitPips * g_pip;

   sl = (sl > 0.0) ? NormalizeDouble(sl, _Digits) : 0.0;
   tp = (tp > 0.0) ? NormalizeDouble(tp, _Digits) : 0.0;

   if(!StopsRespectMinDistance(price, sl, tp))
     {
      Print("Sentinal: stops too close to price for this broker; trade skipped.");
      return;
     }

   double lots = CalculateLots();
   if(lots <= 0.0)
     {
      Print("Sentinal: computed lot size is zero; trade skipped.");
      return;
     }

   bool ok = (type == ORDER_TYPE_BUY)
             ? trade.Buy(lots, _Symbol, 0.0, sl, tp, "Sentinal")
             : trade.Sell(lots, _Symbol, 0.0, sl, tp, "Sentinal");

   if(!ok)
      PrintFormat("Sentinal: order failed. retcode=%d (%s)",
                  trade.ResultRetcode(), trade.ResultRetcodeDescription());
   else
      PrintFormat("Sentinal: %s %.2f lots @ %s  SL=%s TP=%s",
                  (type == ORDER_TYPE_BUY ? "BUY" : "SELL"), lots,
                  DoubleToString(trade.ResultPrice(), _Digits),
                  DoubleToString(sl, _Digits), DoubleToString(tp, _Digits));
  }

//+------------------------------------------------------------------+
//| Position sizing                                                  |
//+------------------------------------------------------------------+
double CalculateLots()
  {
   double lots;

   if(!InpUseRiskPercent)
      lots = InpFixedLots;
   else
     {
      double balance   = AccountInfoDouble(ACCOUNT_BALANCE);
      double riskMoney = balance * InpRiskPercent / 100.0;

      double tickValue = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_VALUE);
      double tickSize  = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_SIZE);
      if(tickValue <= 0.0 || tickSize <= 0.0)
        {
         Print("Sentinal: broker did not report tick value/size; cannot size by risk.");
         return(0.0);
        }

      // Money lost per lot if the stop is hit.
      double slPrice     = InpStopLossPips * g_pip;
      double lossPerLot  = (slPrice / tickSize) * tickValue;
      if(lossPerLot <= 0.0)
         return(0.0);

      lots = riskMoney / lossPerLot;
     }

   return(NormalizeLots(lots));
  }

//+------------------------------------------------------------------+
//| Clamp a lot size to the broker's min / max / step               |
//+------------------------------------------------------------------+
double NormalizeLots(double lots)
  {
   double minLot  = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN);
   double maxLot  = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MAX);
   double lotStep = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_STEP);

   if(lotStep <= 0.0)
      lotStep = 0.01;

   lots = MathFloor(lots / lotStep) * lotStep;
   lots = MathMax(minLot, MathMin(maxLot, lots));

   // Guard against float dust producing 0.30000000000000004 style values.
   int lotDigits = (int)MathMax(0, MathRound(-MathLog10(lotStep)));
   return(NormalizeDouble(lots, lotDigits));
  }

//+------------------------------------------------------------------+
//| Reject stops the broker will not accept                          |
//+------------------------------------------------------------------+
bool StopsRespectMinDistance(const double price, const double sl, const double tp)
  {
   long stopLevel = SymbolInfoInteger(_Symbol, SYMBOL_TRADE_STOPS_LEVEL);
   if(stopLevel <= 0)
      return(true);

   double minDist = stopLevel * _Point;

   if(sl > 0.0 && MathAbs(price - sl) < minDist)
      return(false);
   if(tp > 0.0 && MathAbs(price - tp) < minDist)
      return(false);

   return(true);
  }

//+------------------------------------------------------------------+
//| Guards                                                           |
//+------------------------------------------------------------------+
bool TradingReady()
  {
   if(!TerminalInfoInteger(TERMINAL_CONNECTED))     return(false);
   if(!MQLInfoInteger(MQL_TRADE_ALLOWED))           return(false);
   if(!AccountInfoInteger(ACCOUNT_TRADE_ALLOWED))   return(false);
   if(!AccountInfoInteger(ACCOUNT_TRADE_EXPERT))    return(false);
   if(SymbolInfoInteger(_Symbol, SYMBOL_TRADE_MODE) == SYMBOL_TRADE_MODE_DISABLED)
      return(false);
   return(true);
  }

bool SpreadAcceptable()
  {
   if(InpMaxSpreadPips <= 0.0)
      return(true);
   return(CurrentSpreadPips() <= InpMaxSpreadPips);
  }

double CurrentSpreadPips()
  {
   double ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
   double bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);
   if(g_pip <= 0.0)
      return(0.0);
   return((ask - bid) / g_pip);
  }

int OpenPositionCount()
  {
   int count = 0;
   for(int i = PositionsTotal() - 1; i >= 0; i--)
     {
      if(!position.SelectByIndex(i))
         continue;
      if(position.Symbol() == _Symbol && position.Magic() == InpMagicNumber)
         count++;
     }
   return(count);
  }

//+------------------------------------------------------------------+
//| True once per completed bar                                      |
//+------------------------------------------------------------------+
bool IsNewBar()
  {
   static datetime lastBar = 0;
   datetime thisBar = (datetime)SeriesInfoInteger(_Symbol, PERIOD_CURRENT, SERIES_LASTBAR_DATE);
   if(thisBar == lastBar)
      return(false);
   lastBar = thisBar;
   return(true);
  }

//+------------------------------------------------------------------+
//| Status panel — the MT5 equivalent of the web connection panel.   |
//| Every value here is read straight from the terminal, so it       |
//| reports real state rather than an inferred one.                  |
//+------------------------------------------------------------------+
void PanelUpdate()
  {
   bool connected = TerminalInfoInteger(TERMINAL_CONNECTED);
   bool expertsOn = MQLInfoInteger(MQL_TRADE_ALLOWED) &&
                    AccountInfoInteger(ACCOUNT_TRADE_ALLOWED) &&
                    AccountInfoInteger(ACCOUNT_TRADE_EXPERT);

   string state;
   color  stateColor;
   if(!connected)      { state = "DISCONNECTED";  stateColor = clrOrangeRed; }
   else if(g_halted)   { state = "HALTED (target)";stateColor = clrGold;     }
   else if(!expertsOn) { state = "TRADING BLOCKED";stateColor = clrOrangeRed; }
   else if(!InpAutoTrade){state = "MONITOR ONLY"; stateColor = clrGold;      }
   else                { state = "LIVE";          stateColor = clrLime;      }

   datetime lastTick = (datetime)SymbolInfoInteger(_Symbol, SYMBOL_TIME);
   double   equity   = AccountInfoDouble(ACCOUNT_EQUITY);
   double   profit   = equity - g_startBalance;

   int row = 0;
   PanelLine(row++, "Sentinal", stateColor, state);
   PanelLine(row++, "Server",   InpPanelColor, AccountInfoString(ACCOUNT_SERVER));
   PanelLine(row++, "Account",  InpPanelColor,
             IntegerToString(AccountInfoInteger(ACCOUNT_LOGIN)) + "  " +
             AccountInfoString(ACCOUNT_CURRENCY) +
             (AccountInfoInteger(ACCOUNT_TRADE_MODE) == ACCOUNT_TRADE_MODE_DEMO ? "  [DEMO]" : "  [REAL]"));
   PanelLine(row++, "Symbol",   InpPanelColor,
             _Symbol + "  " + EnumToString((ENUM_TIMEFRAMES)Period()));
   PanelLine(row++, "Strategy", InpPanelColor, EnumToString(InpStrategy));
   PanelLine(row++, "Bid/Ask",  InpPanelColor,
             DoubleToString(SymbolInfoDouble(_Symbol, SYMBOL_BID), _Digits) + " / " +
             DoubleToString(SymbolInfoDouble(_Symbol, SYMBOL_ASK), _Digits));
   PanelLine(row++, "Spread",   InpPanelColor,
             DoubleToString(CurrentSpreadPips(), 1) + " pips" +
             (SpreadAcceptable() ? "" : "  (too wide)"));
   PanelLine(row++, "Last tick",InpPanelColor,
             (lastTick > 0 ? TimeToString(lastTick, TIME_DATE | TIME_SECONDS) : "none"));
   PanelLine(row++, "Positions",InpPanelColor,
             IntegerToString(OpenPositionCount()) + " / " + IntegerToString(InpMaxPositions));
   PanelLine(row++, "Equity",   InpPanelColor,
             DoubleToString(equity, 2) + "   P/L " + DoubleToString(profit, 2));

   ChartRedraw();
  }

//+------------------------------------------------------------------+
//| Draw one label row                                               |
//+------------------------------------------------------------------+
void PanelLine(const int row, const string label, const color clr, const string value)
  {
   string name = PANEL_PREFIX + IntegerToString(row);

   if(ObjectFind(0, name) < 0)
     {
      ObjectCreate(0, name, OBJ_LABEL, 0, 0, 0);
      ObjectSetInteger(0, name, OBJPROP_CORNER, CORNER_LEFT_UPPER);
      ObjectSetInteger(0, name, OBJPROP_XDISTANCE, 12);
      ObjectSetInteger(0, name, OBJPROP_FONTSIZE, 9);
      ObjectSetString(0, name, OBJPROP_FONT, "Consolas");
      ObjectSetInteger(0, name, OBJPROP_SELECTABLE, false);
      ObjectSetInteger(0, name, OBJPROP_HIDDEN, true);
     }

   ObjectSetInteger(0, name, OBJPROP_YDISTANCE, 20 + row * 16);
   ObjectSetInteger(0, name, OBJPROP_COLOR, clr);
   ObjectSetString(0, name, OBJPROP_TEXT,
                   StringFormat("%-10s %s", label + ":", value));
  }
//+------------------------------------------------------------------+
