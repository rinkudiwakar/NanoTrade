import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface OrderBookEntry {
  price: number;
  quantity: number;
}

export interface Trade {
  id: string;
  price: number;
  quantity: number;
  side: string;
  timestamp: number | string;
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface MarketState {
  currentSymbol: string;
  priceUsd: number;
  conversionRate: number;
  orderbook: { bids: OrderBookEntry[]; asks: OrderBookEntry[] };
  recentTrades: Trade[];
  candles: Candle[];

  setCurrentSymbol: (symbol: string) => void;
  setPriceUsd: (price: number) => void;
  setConversionRate: (rate: number) => void;
  setOrderbook: (bids: OrderBookEntry[], asks: OrderBookEntry[]) => void;
  addTrades: (trades: Trade[]) => void;
  updateCandle: (candle: Candle) => void;
}

export const useMarketStore = create<MarketState>()(
  persist(
    (set) => ({
      currentSymbol: 'BTC_USDT',
      priceUsd: 0,
      conversionRate: 90,
      orderbook: { bids: [], asks: [] },
      recentTrades: [],
      candles: [],

      setCurrentSymbol: (symbol) => set({ currentSymbol: symbol }),
      setPriceUsd: (price) => set({ priceUsd: price }),
      setConversionRate: (rate) => set({ conversionRate: rate }),
      setOrderbook: (bids, asks) => set({ orderbook: { bids, asks } }),

      addTrades: (trades) =>
        set((state) => ({
          // Prepend newest trades, avoid duplicates by id, keep max 100
          recentTrades: [
            ...trades.filter(
              (t) => !state.recentTrades.some((r) => r.id === t.id)
            ),
            ...state.recentTrades,
          ].slice(0, 100),
        })),

      updateCandle: (candle) =>
        set((state) => {
          const existing = [...state.candles];
          if (existing.length === 0) return { candles: [candle] };

          const last = existing[existing.length - 1];
          if (last.time === candle.time) {
            // Proper OHLC merge: preserve open, expand high/low, always update close
            existing[existing.length - 1] = {
              ...last,
              high: Math.max(last.high, candle.high),
              low: Math.min(last.low, candle.low),
              close: candle.close,
              volume: last.volume + (candle.volume || 0),
            };
          } else if (candle.time > last.time) {
            existing.push({ ...candle, open: last.close });
          }

          if (existing.length > 1000) existing.shift();
          return { candles: existing };
        }),
    }),
    {
      name: 'nanotrade-market-v1',
      storage: createJSONStorage(() => sessionStorage),
      // Only persist trades and candles — price/orderbook are always live
      partialize: (state) => ({
        recentTrades: state.recentTrades.slice(0, 50),
        candles: state.candles.slice(-300),
        conversionRate: state.conversionRate,
      }),
    }
  )
);
