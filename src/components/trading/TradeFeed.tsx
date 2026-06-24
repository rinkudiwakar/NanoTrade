import React from 'react';
import { useMarketStore } from '@/store/marketStore';

export const TradeFeed = React.memo(() => {
  const trades = useMarketStore((state) => state.recentTrades);

  return (
    <div className="flex h-full flex-col bg-card text-xs font-mono">
      <div className="p-2 font-semibold text-muted-foreground flex justify-between font-sans text-sm">
        <span>Recent Trades</span>
      </div>
      <div className="flex justify-between px-3 py-1 text-[10px] text-muted-foreground">
        <span className="w-1/3 text-left">Price(INR)</span>
        <span className="w-1/3 text-right">Amount</span>
        <span className="w-1/3 text-right">Time</span>
      </div>
      <div className="flex-1 overflow-auto">
        {trades.map((trade, i) => {
          const priceInr = trade.price;
          const isBuy = (trade.side || 'BUY').toUpperCase() === 'BUY';
          const time = new Date(trade.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second:'2-digit' });
          
          return (
            <div key={trade.id || i} className="flex justify-between px-3 py-[2px] hover:bg-accent/50 cursor-pointer">
              <span className={`w-1/3 text-left ${isBuy ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
                {priceInr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="w-1/3 text-right text-[#EAECEF]">{trade.quantity.toFixed(4)}</span>
              <span className="w-1/3 text-right text-[#848E9C]">{time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

TradeFeed.displayName = 'TradeFeed';
