//+------------------------------------------------------------------+
//|                                                     Sentinal.mq5 |
//|                     Trend-adaptive Expert Advisor for MetaTrader 5 |
//+------------------------------------------------------------------+
#property copyright "Sentinal"
#property version   "2.00"
#property strict
#property description "Trend-adaptive MT5 bot. Higher-timeframe trend filter,"
#property description "ATR volatility-scaled stops, trailing stop and reversal"
#property description "handling. Tuned defaults for XAUUSD."

#include <Trade/Trade.mqh>
#include <Trade/PositionInfo.mqh>

//+------------------------------------------------------------------+
//| Enums                                                            |
//+------------------------------------------------------------------+
enum EStrategy
  {
   STRAT_EMA_CROSS,      // EMA cross (fast crosses slow)
   STRAT_RSI_REVERSION,  // RSI reversion (leaves oversold/overbought)
   STRAT_BREAKOUT        // Breakout of N-bar high/low
  };

enum ESignal { SIGNAL_NONE = 0, SIGNAL_BUY = 1, SIGNAL_SELL = -1 };

//+------------------------------------------------------------------+
//| Inputs                                                           |
//|                                                                  |
//| All distances are in POINTS, never "pips". A point is the        |
//| smallest quote increment for the symbol, so the same number      |
//| means the same thing on XAUUSD, EURUSD and indices alike.        |
//| On 2-digit gold, 1 point = 0.01, so 100 points = $1.00 of price. |
//+------------------------------------------------------------------+
input group "=== Trading ==="
input bool   InpAutoTrade        = false;  // Auto-trade (false = monitor only)
input long   InpMagicNumber      = 770001; // Magic number
input int    InpMaxPositions     = 1;      // Max simultaneous positions

input group "=== Trend adaptation ==="
input bool   InpUseTrendFilter   = true;   // Only trade with the higher-TF trend
input ENUM_TIMEFRAMES InpTrendTF = PERIOD_H1; // Trend timeframe
input int    InpTrendEMA         = 200;    // Trend EMA period
input bool   InpUseADX           = true;   // Require a trending market
input int    InpADXPeriod        = 14;     // ADX period
input double InpADXMin           = 20.0;   // Min ADX to trade
input bool   InpCloseOnReverse   = true;   // Close position when trend flips

input group "=== Entry ==="
input EStrategy InpStrategy      = STRAT_EMA_CROSS; // Entry strategy
input int    InpFastEMA          = 12;     // EMA cross: fast period
input int    InpSlowEMA          = 26;     // EMA cross: slow period
input int    InpRSIPeriod        = 14;     // RSI: period
input int    InpRSIOversold      = 30;     // RSI: oversold level
input int    InpRSIOverbought    = 70;     // RSI: overbought level
input int    InpBreakoutBars     = 20;     // Breakout: lookback bars

input group "=== Risk ==="
input bool   InpUseRiskPercent   = true;   // Size by risk % (false = fixed lots)
input double InpRiskPercent      = 1.0;    // Risk per trade (% of balance)
input double InpFixedLots        = 0.01;   // Fixed lot size
input bool   InpAllowMinLot      = false;  // Trade min lot even if it exceeds risk

input group "=== Stops (ATR-scaled) ==="
input bool   InpUseATRStops      = true;   // Scale stops to live volatility
input int    InpATRPeriod        = 14;     // ATR period
input double InpATRStopMult      = 2.0;    // Stop = ATR x this
input double InpATRTargetMult    = 3.0;    // Target = ATR x this
input int    InpStopLossPoints   = 3000;   // Fixed stop (points, if ATR off)
input int    InpTakeProfitPoints = 6000;   // Fixed target (points, if ATR off)
input bool   InpUseTrailingStop  = true;   // Trail the stop as price moves
input double InpATRTrailMult     = 2.0;    // Trail distance = ATR x this

input group "=== Filters ==="
input int    InpMaxSpreadPoints  = 500;    // Max spread (points, 0 = ignore)
input double InpMaxSpreadATR     = 0.5;    // Max spread as fraction of ATR (0 = ignore)
input double InpTargetProfit     = 0.0;    // Halt at account profit (0 = off)
input bool   InpUseTimeFilter    = false;  // Restrict trading hours
input int    InpStartHour        = 0;      // Start hour (server time)
input int    InpEndHour          = 24;     // End hour (server time)

input group "=== Display ==="
input bool   InpVerboseLog       = true;   // Log why each bar did/didn't trade
input bool   InpShowPanel        = true;   // Show status panel
input color  InpPanelColor       = clrWhite; // Panel text colour

//+------------------------------------------------------------------+
//| Globals                                                          |
//+------------------------------------------------------------------+
CTrade         trade;
CPositionInfo  position;

double   g_startBalance = 0.0;
bool     g_halted       = false;
datetime g_lastBar      = 0;

int g_hFast  = INVALID_HANDLE;
int g_hSlow  = INVALID_HANDLE;
int g_hRSI   = INVALID_HANDLE;
int g_hATR   = INVALID_HANDLE;
int g_hTrend = INVALID_HANDLE;
int g_hADX   = INVALID_HANDLE;

const string PANEL_PREFIX = "SENT_";

//+------------------------------------------------------------------+
//| Initialisation                                                   |
//+------------------------------------------------------------------+
int OnInit()
  {
   trade.SetExpertMagicNumber((ulong)InpMagicNumber);
   trade.SetTypeFillingBySymbol(_Symbol);
   trade.SetDeviationInPoints(30);

   g_startBalance = AccountInfoDouble(ACCOUNT_BALANCE);
   g_halted       = false;

   // Seed the bar stamp now, so attaching mid-bar does not immediately
   // count as "a new bar" and fire an entry on stale conditions.
   g_lastBar = (datetime)SeriesInfoInteger(_Symbol, PERIOD_CURRENT, SERIES_LASTBAR_DATE);

   if(!ValidateInputs())
      return(INIT_PARAMETERS_INCORRECT);

   if(!CreateIndicators())
      return(INIT_FAILED);

   if(InpShowPanel)
      PanelUpdate();

   PrintFormat("Sentinal v2 on %s | strategy=%s | auto-trade=%s | digits=%d | point=%s",
               _Symbol, EnumToString(InpStrategy), (InpAutoTrade ? "ON" : "OFF"),
               _Digits, DoubleToString(_Point, _Digits));

   return(INIT_SUCCEEDED);
  }

//+------------------------------------------------------------------+
//| Shutdown                                                         |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
  {
   if(g_hFast  != INVALID_HANDLE) IndicatorRelease(g_hFast);
   if(g_hSlow  != INVALID_HANDLE) IndicatorRelease(g_hSlow);
   if(g_hRSI   != INVALID_HANDLE) IndicatorRelease(g_hRSI);
   if(g_hATR   != INVALID_HANDLE) IndicatorRelease(g_hATR);
   if(g_hTrend != INVALID_HANDLE) IndicatorRelease(g_hTrend);
   if(g_hADX   != INVALID_HANDLE) IndicatorRelease(g_hADX);

   ObjectsDeleteAll(0, PANEL_PREFIX);
   ChartRedraw();
  }

//+------------------------------------------------------------------+
//| Input validation                                                 |
//+------------------------------------------------------------------+
bool ValidateInputs()
  {
   if(InpUseRiskPercent && InpRiskPercent <= 0.0)
     { Print("Sentinal: InpRiskPercent must be > 0."); return(false); }
   if(!InpUseRiskPercent && InpFixedLots <= 0.0)
     { Print("Sentinal: InpFixedLots must be > 0."); return(false); }
   if(!InpUseATRStops && InpStopLossPoints <= 0)
     { Print("Sentinal: fixed stops need InpStopLossPoints > 0."); return(false); }
   if(InpUseATRStops && InpATRStopMult <= 0.0)
     { Print("Sentinal: InpATRStopMult must be > 0."); return(false); }
   if(InpMaxPositions < 1)
     { Print("Sentinal: InpMaxPositions must be >= 1."); return(false); }

   if(InpStrategy == STRAT_EMA_CROSS && InpFastEMA >= InpSlowEMA)
     { Print("Sentinal: InpFastEMA must be smaller than InpSlowEMA."); return(false); }
   if(InpStrategy == STRAT_RSI_REVERSION &&
      (InpRSIOversold <= 0 || InpRSIOverbought >= 100 || InpRSIOversold >= InpRSIOverbought))
     { Print("Sentinal: need 0 < oversold < overbought < 100."); return(false); }
   if(InpStrategy == STRAT_BREAKOUT && InpBreakoutBars < 2)
     { Print("Sentinal: InpBreakoutBars must be >= 2."); return(false); }

   if(InpUseTimeFilter && (InpStartHour < 0 || InpEndHour > 24 || InpStartHour >= InpEndHour))
     { Print("Sentinal: need 0 <= StartHour < EndHour <= 24."); return(false); }

   return(true);
  }

//+------------------------------------------------------------------+
//| Indicator handles                                                |
//+------------------------------------------------------------------+
bool CreateIndicators()
  {
   switch(InpStrategy)
     {
      case STRAT_EMA_CROSS:
         g_hFast = iMA(_Symbol, PERIOD_CURRENT, InpFastEMA, 0, MODE_EMA, PRICE_CLOSE);
         g_hSlow = iMA(_Symbol, PERIOD_CURRENT, InpSlowEMA, 0, MODE_EMA, PRICE_CLOSE);
         if(g_hFast == INVALID_HANDLE || g_hSlow == INVALID_HANDLE)
           { Print("Sentinal: EMA handle failed. err=", GetLastError()); return(false); }
         break;

      case STRAT_RSI_REVERSION:
         g_hRSI = iRSI(_Symbol, PERIOD_CURRENT, InpRSIPeriod, PRICE_CLOSE);
         if(g_hRSI == INVALID_HANDLE)
           { Print("Sentinal: RSI handle failed. err=", GetLastError()); return(false); }
         break;

      case STRAT_BREAKOUT:
         break;   // raw price data, no handle needed
     }

   if(InpUseATRStops || InpUseTrailingStop)
     {
      g_hATR = iATR(_Symbol, PERIOD_CURRENT, InpATRPeriod);
      if(g_hATR == INVALID_HANDLE)
        { Print("Sentinal: ATR handle failed. err=", GetLastError()); return(false); }
     }

   if(InpUseTrendFilter)
     {
      g_hTrend = iMA(_Symbol, InpTrendTF, InpTrendEMA, 0, MODE_EMA, PRICE_CLOSE);
      if(g_hTrend == INVALID_HANDLE)
        { Print("Sentinal: trend EMA handle failed. err=", GetLastError()); return(false); }
     }

   if(InpUseADX)
     {
      g_hADX = iADX(_Symbol, InpTrendTF, InpADXPeriod);
      if(g_hADX == INVALID_HANDLE)
        { Print("Sentinal: ADX handle failed. err=", GetLastError()); return(false); }
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

   // Manage what is already open every tick, not just on new bars —
   // trailing stops and reversals should not wait for a candle to close.
   ManageOpenPositions();

   if(InpTargetProfit > 0.0 && !g_halted)
     {
      double profit = AccountInfoDouble(ACCOUNT_EQUITY) - g_startBalance;
      if(profit >= InpTargetProfit)
        {
         g_halted = true;
         PrintFormat("Sentinal: target profit %.2f reached (%.2f). Halting new entries.",
                     InpTargetProfit, profit);
        }
     }
   if(g_halted || !InpAutoTrade)
      return;

   if(!IsNewBar())
      return;

   // Work out whether this bar trades, and if not, exactly why. "Nothing
   // is happening" is the normal state for a filtered strategy, so the
   // log has to distinguish that from something actually being broken.
   string  block  = "";
   ESignal signal = SIGNAL_NONE;
   int     trend  = 0;

   if(!WithinTradingHours())
      block = "outside trading hours";
   else if(!SpreadAcceptable())
      block = StringFormat("spread %.0f pts too wide", CurrentSpreadPoints());
   else if(OpenPositionCount() >= InpMaxPositions)
      block = "position limit reached";
   else
     {
      signal = Signal();
      trend  = TrendDirection();

      if(signal == SIGNAL_NONE)
         block = "no entry signal";
      else if(InpUseTrendFilter && trend == 0)
         block = "trend undecided / ADX below minimum";
      else if(InpUseTrendFilter && trend != (int)signal)
         block = "signal against higher-TF trend";
     }

   if(InpVerboseLog)
     {
      double atr = CurrentATR();
      PrintFormat("Sentinal bar %s | signal=%s trend=%s spread=%.0f atr=%.0f -> %s",
                  TimeToString(g_lastBar, TIME_DATE | TIME_MINUTES),
                  (signal == SIGNAL_BUY ? "BUY" : (signal == SIGNAL_SELL ? "SELL" : "none")),
                  (trend > 0 ? "up" : (trend < 0 ? "down" : "flat")),
                  CurrentSpreadPoints(),
                  (atr > 0.0 ? atr / _Point : 0.0),
                  (block == "" ? "ENTERING" : block));
     }

   if(block != "")
      return;

   OpenTrade(signal == SIGNAL_BUY ? ORDER_TYPE_BUY : ORDER_TYPE_SELL);
  }

//+------------------------------------------------------------------+
//| Trend direction: +1 up, -1 down, 0 undecided / not trending      |
//+------------------------------------------------------------------+
int TrendDirection()
  {
   if(!InpUseTrendFilter)
      return(0);

   double ema[];
   ArraySetAsSeries(ema, true);
   if(CopyBuffer(g_hTrend, 0, 0, 2, ema) < 2)
      return(0);

   // ADX measures trend strength, not direction: a low reading means
   // the market is ranging, where trend-following entries bleed.
   if(InpUseADX)
     {
      double adx[];
      ArraySetAsSeries(adx, true);
      if(CopyBuffer(g_hADX, 0, 0, 2, adx) < 2)
         return(0);
      if(adx[0] < InpADXMin)
         return(0);
     }

   double price = SymbolInfoDouble(_Symbol, SYMBOL_BID);
   if(price <= 0.0)
      return(0);

   if(price > ema[0]) return(1);
   if(price < ema[0]) return(-1);
   return(0);
  }

//+------------------------------------------------------------------+
//| Entry signals — all read CLOSED candles only                     |
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

ESignal SignalEmaCross()
  {
   double fast[], slow[];
   ArraySetAsSeries(fast, true);
   ArraySetAsSeries(slow, true);

   if(CopyBuffer(g_hFast, 0, 1, 2, fast) < 2) return(SIGNAL_NONE);
   if(CopyBuffer(g_hSlow, 0, 1, 2, slow) < 2) return(SIGNAL_NONE);

   if(fast[1] <= slow[1] && fast[0] > slow[0]) return(SIGNAL_BUY);
   if(fast[1] >= slow[1] && fast[0] < slow[0]) return(SIGNAL_SELL);
   return(SIGNAL_NONE);
  }

ESignal SignalRsiReversion()
  {
   double rsi[];
   ArraySetAsSeries(rsi, true);
   if(CopyBuffer(g_hRSI, 0, 1, 2, rsi) < 2) return(SIGNAL_NONE);

   if(rsi[1] <  InpRSIOversold   && rsi[0] >= InpRSIOversold)   return(SIGNAL_BUY);
   if(rsi[1] >  InpRSIOverbought && rsi[0] <= InpRSIOverbought) return(SIGNAL_SELL);
   return(SIGNAL_NONE);
  }

ESignal SignalBreakout()
  {
   MqlRates r[];
   ArraySetAsSeries(r, true);

   int need = InpBreakoutBars + 2;
   if(CopyRates(_Symbol, PERIOD_CURRENT, 0, need, r) < need)
      return(SIGNAL_NONE);

   // Range excludes the bar that just closed, so its close is tested
   // against a range it did not help form.
   double hi = r[2].high, lo = r[2].low;
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
//| Current ATR in price terms                                       |
//+------------------------------------------------------------------+
double CurrentATR()
  {
   if(g_hATR == INVALID_HANDLE)
      return(0.0);

   double atr[];
   ArraySetAsSeries(atr, true);
   if(CopyBuffer(g_hATR, 0, 1, 1, atr) < 1)
      return(0.0);

   return(atr[0]);
  }

//+------------------------------------------------------------------+
//| Stop / target distances in price, adapted to live volatility     |
//+------------------------------------------------------------------+
bool StopDistances(double &stopDist, double &targetDist)
  {
   if(InpUseATRStops)
     {
      double atr = CurrentATR();
      if(atr <= 0.0)
        {
         Print("Sentinal: ATR unavailable; skipping entry.");
         return(false);
        }
      stopDist   = atr * InpATRStopMult;
      targetDist = atr * InpATRTargetMult;
     }
   else
     {
      stopDist   = InpStopLossPoints   * _Point;
      targetDist = InpTakeProfitPoints * _Point;
     }

   // Respect the broker's minimum stop distance by widening, not by
   // abandoning the trade.
   double minDist = MinStopDistance();
   if(stopDist   < minDist) stopDist   = minDist;
   if(targetDist > 0.0 && targetDist < minDist) targetDist = minDist;

   return(stopDist > 0.0);
  }

double MinStopDistance()
  {
   long stopLevel  = SymbolInfoInteger(_Symbol, SYMBOL_TRADE_STOPS_LEVEL);
   long freezeLvl  = SymbolInfoInteger(_Symbol, SYMBOL_TRADE_FREEZE_LEVEL);
   long lvl        = MathMax(stopLevel, freezeLvl);
   double spread   = SymbolInfoDouble(_Symbol, SYMBOL_ASK) -
                     SymbolInfoDouble(_Symbol, SYMBOL_BID);

   // A stop inside the spread is hit the instant it is placed.
   return(MathMax(lvl * _Point, spread * 2.0));
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

   double stopDist, targetDist;
   if(!StopDistances(stopDist, targetDist))
      return;

   double sl = (type == ORDER_TYPE_BUY) ? price - stopDist : price + stopDist;
   double tp = 0.0;
   if(targetDist > 0.0)
      tp = (type == ORDER_TYPE_BUY) ? price + targetDist : price - targetDist;

   sl = NormalizeDouble(sl, _Digits);
   tp = (tp > 0.0) ? NormalizeDouble(tp, _Digits) : 0.0;

   double lots = CalculateLots(stopDist);
   if(lots <= 0.0)
      return;

   if(!MarginSufficient(type, lots, price))
      return;

   bool ok = (type == ORDER_TYPE_BUY)
             ? trade.Buy(lots, _Symbol, 0.0, sl, tp, "Sentinal")
             : trade.Sell(lots, _Symbol, 0.0, sl, tp, "Sentinal");

   if(!ok)
      PrintFormat("Sentinal: order failed. retcode=%d (%s)",
                  trade.ResultRetcode(), trade.ResultRetcodeDescription());
   else
      PrintFormat("Sentinal: %s %.2f lots @ %s  SL=%s TP=%s  (stop %.0f pts)",
                  (type == ORDER_TYPE_BUY ? "BUY" : "SELL"), lots,
                  DoubleToString(trade.ResultPrice(), _Digits),
                  DoubleToString(sl, _Digits), DoubleToString(tp, _Digits),
                  stopDist / _Point);
  }

//+------------------------------------------------------------------+
//| Position sizing from the actual stop distance                    |
//+------------------------------------------------------------------+
double CalculateLots(const double stopDist)
  {
   double minLot  = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN);
   double lots;

   if(!InpUseRiskPercent)
      lots = InpFixedLots;
   else
     {
      double tickValue = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_VALUE);
      double tickSize  = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_SIZE);
      if(tickValue <= 0.0 || tickSize <= 0.0 || stopDist <= 0.0)
        {
         Print("Sentinal: cannot size by risk (bad tick value/size).");
         return(0.0);
        }

      double riskMoney  = AccountInfoDouble(ACCOUNT_BALANCE) * InpRiskPercent / 100.0;
      double lossPerLot = (stopDist / tickSize) * tickValue;
      if(lossPerLot <= 0.0)
         return(0.0);

      lots = riskMoney / lossPerLot;

      // Refuse to silently exceed the configured risk. On gold the min
      // lot can risk more than 1% of a small account in one trade.
      if(lots < minLot)
        {
         if(!InpAllowMinLot)
           {
            PrintFormat("Sentinal: min lot %.2f exceeds %.1f%% risk on a %.0f point stop. "
                        "Trade skipped. Raise InpRiskPercent or set InpAllowMinLot.",
                        minLot, InpRiskPercent, stopDist / _Point);
            return(0.0);
           }
         PrintFormat("Sentinal: sizing up to min lot %.2f — this trade risks more "
                     "than %.1f%%.", minLot, InpRiskPercent);
        }
     }

   return(NormalizeLots(lots));
  }

double NormalizeLots(double lots)
  {
   double minLot  = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN);
   double maxLot  = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MAX);
   double lotStep = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_STEP);
   if(lotStep <= 0.0) lotStep = 0.01;

   lots = MathFloor(lots / lotStep) * lotStep;
   lots = MathMax(minLot, MathMin(maxLot, lots));

   int lotDigits = (int)MathMax(0, MathRound(-MathLog10(lotStep)));
   return(NormalizeDouble(lots, lotDigits));
  }

//+------------------------------------------------------------------+
//| Reject the order before the broker does                          |
//+------------------------------------------------------------------+
bool MarginSufficient(const ENUM_ORDER_TYPE type, const double lots, const double price)
  {
   double required = 0.0;
   if(!OrderCalcMargin(type, _Symbol, lots, price, required))
     {
      Print("Sentinal: OrderCalcMargin failed. err=", GetLastError());
      return(false);
     }

   double freeMargin = AccountInfoDouble(ACCOUNT_MARGIN_FREE);
   if(required > freeMargin)
     {
      PrintFormat("Sentinal: not enough free margin (need %.2f, have %.2f).",
                  required, freeMargin);
      return(false);
     }
   return(true);
  }

//+------------------------------------------------------------------+
//| Manage open positions: reversal exit, then trailing stop         |
//+------------------------------------------------------------------+
void ManageOpenPositions()
  {
   int trend = TrendDirection();
   double atr = (InpUseTrailingStop ? CurrentATR() : 0.0);

   for(int i = PositionsTotal() - 1; i >= 0; i--)
     {
      if(!position.SelectByIndex(i))
         continue;
      if(position.Symbol() != _Symbol || position.Magic() != InpMagicNumber)
         continue;

      bool isBuy = (position.PositionType() == POSITION_TYPE_BUY);
      int  dir   = isBuy ? 1 : -1;

      // Trend flipped against an open trade — exit rather than sit
      // through it waiting for the stop.
      if(InpCloseOnReverse && InpUseTrendFilter && trend != 0 && trend != dir)
        {
         if(trade.PositionClose(position.Ticket()))
            PrintFormat("Sentinal: closed #%I64u on trend reversal.", position.Ticket());
         else
            PrintFormat("Sentinal: failed to close #%I64u. retcode=%d",
                        position.Ticket(), trade.ResultRetcode());
         continue;
        }

      if(!InpUseTrailingStop || atr <= 0.0)
         continue;

      double trailDist = MathMax(atr * InpATRTrailMult, MinStopDistance());
      double current   = isBuy ? SymbolInfoDouble(_Symbol, SYMBOL_BID)
                               : SymbolInfoDouble(_Symbol, SYMBOL_ASK);
      double newSL     = isBuy ? current - trailDist : current + trailDist;
      newSL = NormalizeDouble(newSL, _Digits);

      double oldSL = position.StopLoss();

      // Only ever tighten, never loosen — so trailing can reduce the risk
      // on a trade but never widen it beyond the original stop. The stop
      // must also stay on the correct side of the current price.
      bool improves = isBuy
                      ? (newSL < current && (oldSL <= 0.0 || newSL > oldSL))
                      : (newSL > current && (oldSL <= 0.0 || newSL < oldSL));

      if(!improves)
         continue;

      // Skip micro-adjustments; every modify is a server round trip.
      if(oldSL > 0.0 && MathAbs(newSL - oldSL) < MinStopDistance())
         continue;

      if(!trade.PositionModify(position.Ticket(), newSL, position.TakeProfit()))
         PrintFormat("Sentinal: trail modify failed on #%I64u. retcode=%d",
                     position.Ticket(), trade.ResultRetcode());
     }
  }

//+------------------------------------------------------------------+
//| Guards                                                           |
//+------------------------------------------------------------------+
bool TradingReady()
  {
   if(!TerminalInfoInteger(TERMINAL_CONNECTED))   return(false);
   if(!MQLInfoInteger(MQL_TRADE_ALLOWED))         return(false);
   if(!AccountInfoInteger(ACCOUNT_TRADE_ALLOWED)) return(false);
   if(!AccountInfoInteger(ACCOUNT_TRADE_EXPERT))  return(false);
   if(!MarketOpen())                              return(false);
   return(true);
  }

//+------------------------------------------------------------------+
//| Gold trades nearly around the clock but still has a daily break. |
//| Full trade mode plus a fresh tick is the reliable test.          |
//+------------------------------------------------------------------+
bool MarketOpen()
  {
   long mode = SymbolInfoInteger(_Symbol, SYMBOL_TRADE_MODE);
   if(mode != SYMBOL_TRADE_MODE_FULL && mode != SYMBOL_TRADE_MODE_LONGONLY &&
      mode != SYMBOL_TRADE_MODE_SHORTONLY)
      return(false);

   MqlTick tick;
   if(!SymbolInfoTick(_Symbol, tick))
      return(false);
   if(tick.bid <= 0.0 || tick.ask <= 0.0)
      return(false);

   return(true);
  }

bool WithinTradingHours()
  {
   if(!InpUseTimeFilter)
      return(true);

   MqlDateTime t;
   TimeToStruct(TimeCurrent(), t);
   return(t.hour >= InpStartHour && t.hour < InpEndHour);
  }

//+------------------------------------------------------------------+
//| Spread filter.                                                   |
//|                                                                  |
//| An absolute point limit is broker-specific: gold quotes at 2 or  |
//| 3 digits depending on the broker, so the same 26c spread reads   |
//| as 26 points on one and 260 on another. The ATR-relative test    |
//| is the one that actually means something — a spread that is a    |
//| large fraction of the current range eats the trade regardless    |
//| of what the absolute number looks like.                          |
//+------------------------------------------------------------------+
bool SpreadAcceptable()
  {
   double spreadPts = CurrentSpreadPoints();

   if(InpMaxSpreadPoints > 0 && spreadPts > InpMaxSpreadPoints)
      return(false);

   if(InpMaxSpreadATR > 0.0)
     {
      double atr = CurrentATR();
      if(atr > 0.0 && (spreadPts * _Point) > (atr * InpMaxSpreadATR))
         return(false);
     }

   return(true);
  }

double CurrentSpreadPoints()
  {
   double ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
   double bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);
   if(_Point <= 0.0)
      return(0.0);
   return((ask - bid) / _Point);
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

bool IsNewBar()
  {
   datetime thisBar = (datetime)SeriesInfoInteger(_Symbol, PERIOD_CURRENT, SERIES_LASTBAR_DATE);
   if(thisBar == g_lastBar)
      return(false);
   g_lastBar = thisBar;
   return(true);
  }

//+------------------------------------------------------------------+
//| Status panel — every value read straight from the terminal       |
//+------------------------------------------------------------------+
void PanelUpdate()
  {
   bool connected = TerminalInfoInteger(TERMINAL_CONNECTED);
   bool expertsOn = MQLInfoInteger(MQL_TRADE_ALLOWED) &&
                    AccountInfoInteger(ACCOUNT_TRADE_ALLOWED) &&
                    AccountInfoInteger(ACCOUNT_TRADE_EXPERT);

   string state; color stateColor;
   if(!connected)         { state = "DISCONNECTED";    stateColor = clrOrangeRed; }
   else if(!MarketOpen()) { state = "MARKET CLOSED";   stateColor = clrGold;      }
   else if(g_halted)      { state = "HALTED (target)"; stateColor = clrGold;      }
   else if(!expertsOn)    { state = "TRADING BLOCKED"; stateColor = clrOrangeRed; }
   else if(!InpAutoTrade) { state = "MONITOR ONLY";    stateColor = clrGold;      }
   else                   { state = "LIVE";            stateColor = clrLime;      }

   int trend = TrendDirection();
   string trendText = !InpUseTrendFilter ? "off"
                      : (trend > 0 ? "UP" : (trend < 0 ? "DOWN" : "ranging / weak"));

   double atr = CurrentATR();
   double equity = AccountInfoDouble(ACCOUNT_EQUITY);

   int row = 0;
   PanelLine(row++, "Sentinal",  stateColor, state);
   PanelLine(row++, "Server",    InpPanelColor, AccountInfoString(ACCOUNT_SERVER));
   PanelLine(row++, "Account",   InpPanelColor,
             IntegerToString(AccountInfoInteger(ACCOUNT_LOGIN)) + "  " +
             AccountInfoString(ACCOUNT_CURRENCY) +
             (AccountInfoInteger(ACCOUNT_TRADE_MODE) == ACCOUNT_TRADE_MODE_DEMO
              ? "  [DEMO]" : "  [REAL]"));
   PanelLine(row++, "Symbol",    InpPanelColor,
             _Symbol + "  " + EnumToString((ENUM_TIMEFRAMES)Period()));
   PanelLine(row++, "Strategy",  InpPanelColor, EnumToString(InpStrategy));
   PanelLine(row++, "Trend",     InpPanelColor,
             trendText + "  (" + EnumToString(InpTrendTF) + " EMA" +
             IntegerToString(InpTrendEMA) + ")");
   PanelLine(row++, "Bid/Ask",   InpPanelColor,
             DoubleToString(SymbolInfoDouble(_Symbol, SYMBOL_BID), _Digits) + " / " +
             DoubleToString(SymbolInfoDouble(_Symbol, SYMBOL_ASK), _Digits));
   PanelLine(row++, "Spread",    InpPanelColor,
             DoubleToString(CurrentSpreadPoints(), 0) + " / " +
             IntegerToString(InpMaxSpreadPoints) + " pts" +
             (SpreadAcceptable() ? "" : "  (TOO WIDE - no entries)"));
   PanelLine(row++, "ATR",       InpPanelColor,
             (atr > 0.0 ? DoubleToString(atr / _Point, 0) + " pts" : "warming up"));
   PanelLine(row++, "Positions", InpPanelColor,
             IntegerToString(OpenPositionCount()) + " / " + IntegerToString(InpMaxPositions));
   PanelLine(row++, "Equity",    InpPanelColor,
             DoubleToString(equity, 2) + "   P/L " +
             DoubleToString(equity - g_startBalance, 2));

   ChartRedraw();
  }

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
      ObjectSetInteger(0, name, OBJPROP_ZORDER, 1);
     }

   ObjectSetInteger(0, name, OBJPROP_YDISTANCE, 20 + row * 16);
   ObjectSetInteger(0, name, OBJPROP_COLOR, clr);
   ObjectSetString(0, name, OBJPROP_TEXT, StringFormat("%-10s %s", label + ":", value));
  }
//+------------------------------------------------------------------+
