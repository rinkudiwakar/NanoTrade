import React, { useEffect } from 'react';
import { useMarketStore } from '@/store/marketStore';

// Seed recent trades from Binance REST on mount so the feed is never empty
async function fetchRecentTrades(conversionRate: number) {
  try {
    const resp = await fetch(
      'https://api.binance.us/api/v3/trades?symbol=BTCUSDT&limit=50'
    );
    if (!resp.ok) return [];
    const raw: { id: number; price: string; qty: string; time: number; isBuyerMaker: boolean }[] =
      await resp.json();
    return raw.reverse().map((t) => ({
      id: `seed-${t.id}`,
      price: parseFloat(t.price) * conversionRate,
      quantity: parseFloat(t.qty),
      side: t.isBuyerMaker ? 'SELL' : 'BUY',
      timestamp: t.time,
    }));
  } catch {
    return [];
  }
}

export const TradeFeed = React.memo(() => {
  const trades = useMarketStore((state) => state.recentTrades);
  const addTrades = useMarketStore((state) => state.addTrades);


  // Seed from REST API on mount if empty, otherwise use persisted trades
  useEffect(() => {
    if (useMarketStore.getState().recentTrades.length > 0) return;

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    fetch(`${apiUrl}/api/v1/market/price`)
      .then((r) => r.json())
      .then((data) => {
        const rate = data.usd_inr_rate || 90;
        useMarketStore.getState().setConversionRate(rate);
        return fetchRecentTrades(rate);
      })
      .then((seeded) => {
        if (seeded.length > 0) {
          addTrades(seeded);
        }
      })
      .catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only on mount

  return (
    <div className="flex h-full flex-col bg-card text-xs font-mono">
      <div className="p-2 font-semibold text-muted-foreground flex justify-between font-sans text-sm">
        <span>Recent Trades</span>
      </div>
      <div className="flex justify-between px-3 py-1 text-[10px] text-muted-foreground border-b border-border">
        <span className="w-1/3 text-left">Price (INR)</span>
        <span className="w-1/3 text-right">Amount</span>
        <span className="w-1/3 text-right">Time</span>
      </div>
      <div className="flex-1 overflow-auto">
        {trades.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[#848E9C] text-[11px]">
            Loading trades...
          </div>
        ) : (
          trades.map((trade, i) => {
            const priceInr = trade.price;
            const isBuy = (trade.side || 'BUY').toUpperCase() === 'BUY';
            const ts = trade.timestamp;
            const dateObj = ts
              ? new Date(typeof ts === 'number' ? ts : isNaN(Number(ts)) ? ts : Number(ts))
              : new Date();
            const time = isNaN(dateObj.getTime())
              ? '--:--:--'
              : dateObj.toLocaleTimeString([], {
                  hour12: false,
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                });

            return (
              <div
                key={trade.id || i}
                className="flex justify-between px-3 py-[2px] hover:bg-accent/50 cursor-pointer"
              >
                <span className={`w-1/3 text-left ${isBuy ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
                  {priceInr.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span className="w-1/3 text-right text-[#EAECEF]">{trade.quantity.toFixed(4)}</span>
                <span className="w-1/3 text-right text-[#848E9C]">{time}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
});

TradeFeed.displayName = 'TradeFeed';
