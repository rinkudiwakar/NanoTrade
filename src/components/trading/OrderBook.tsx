import React from 'react';
import { useMarketStore } from '@/store/marketStore';

export const OrderBook = React.memo(() => {
  const { bids, asks } = useMarketStore((state) => state.orderbook);
  const priceUsd = useMarketStore((state) => state.priceUsd);
  const conversionRate = useMarketStore((state) => state.conversionRate);

  // Take top 15 rows
  const displayAsks = asks.slice(0, 15).reverse(); // highest to lowest
  const displayBids = bids.slice(0, 15); // highest to lowest
  
  // Calculate cumulative totals for depth bars
  let askTotal = 0;
  const asksWithTotal = displayAsks.map(ask => {
    askTotal += ask.quantity;
    return { ...ask, total: askTotal };
  });

  let bidTotal = 0;
  const bidsWithTotal = displayBids.map(bid => {
    bidTotal += bid.quantity;
    return { ...bid, total: bidTotal };
  });

  const maxTotal = Math.max(askTotal, bidTotal, 1);

  return (
    <div className="flex h-full flex-col bg-card text-xs font-mono">
      <div className="p-2 font-semibold text-muted-foreground flex justify-between font-sans text-sm">
        <span>Order Book</span>
      </div>
      <div className="flex justify-between px-3 py-1 text-[10px] text-muted-foreground">
        <span className="w-1/3 text-left">Price(INR)</span>
        <span className="w-1/3 text-right">Amount</span>
        <span className="w-1/3 text-right">Total</span>
      </div>
      
      {/* Asks (Red) */}
      <div className="flex flex-1 flex-col justify-end overflow-hidden">
        {asksWithTotal.map((ask, i) => {
          const depthPct = (ask.total / maxTotal) * 100;
          return (
            <div key={`ask-${i}`} className="relative flex justify-between px-3 py-[2px] hover:bg-accent/50 cursor-pointer">
              <div className="absolute right-0 top-0 h-full bg-[#F6465D]/10" style={{ width: `${depthPct}%` }} />
              <span className="w-1/3 text-left text-[#F6465D] z-10">{ask.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="w-1/3 text-right z-10 text-[#EAECEF]">{ask.quantity.toFixed(4)}</span>
              <span className="w-1/3 text-right z-10 text-[#848E9C]">{ask.total.toFixed(4)}</span>
            </div>
          );
        })}
      </div>
      
      {/* Spread / Current Price */}
      <div className="flex items-center px-3 py-2 font-semibold text-lg">
        <span className="text-[#0ECB81]">₹{(priceUsd * conversionRate).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        <span className="ml-2 text-sm text-muted-foreground line-through decoration-muted-foreground/50">${priceUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>
      
      {/* Bids (Green) */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {bidsWithTotal.map((bid, i) => {
          const depthPct = (bid.total / maxTotal) * 100;
          return (
            <div key={`bid-${i}`} className="relative flex justify-between px-3 py-[2px] hover:bg-accent/50 cursor-pointer">
              <div className="absolute right-0 top-0 h-full bg-[#0ECB81]/10" style={{ width: `${depthPct}%` }} />
              <span className="w-1/3 text-left text-[#0ECB81] z-10">{bid.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="w-1/3 text-right z-10 text-[#EAECEF]">{bid.quantity.toFixed(4)}</span>
              <span className="w-1/3 text-right z-10 text-[#848E9C]">{bid.total.toFixed(4)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

OrderBook.displayName = 'OrderBook';
