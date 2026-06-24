import { create } from 'zustand';

export interface OrderBookEntry {
  price: number;
  quantity: number;
}

export interface Trade {
  id: string;
  price: number;
  quantity: number;
  side: string;
  timestamp: string;
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
  conversionRate: number; // For INR conversion
  orderbook: { bids: OrderBookEntry[], asks: OrderBookEntry[] };
  recentTrades: Trade[];
  candles: Candle[];
  
  setCurrentSymbol: (symbol: string) => void;
  setPriceUsd: (price: number) => void;
  setConversionRate: (rate: number) => void;
  setOrderbook: (bids: OrderBookEntry[], asks: OrderBookEntry[]) => void;
  addTrades: (trades: Trade[]) => void;
  updateCandle: (candle: Candle) => void;
}

export const useMarketStore = create<MarketState>((set) => ({
  currentSymbol: 'BTC_USDT',
  priceUsd: 0,
  conversionRate: 90, // Fallback conversion rate
  orderbook: { bids: [], asks: [] },
  recentTrades: [],
  candles: [],
  
  setCurrentSymbol: (symbol) => set({ currentSymbol: symbol }),
  setPriceUsd: (price) => set({ priceUsd: price }),
  setConversionRate: (rate) => set({ conversionRate: rate }),
  setOrderbook: (bids, asks) => set({ orderbook: { bids, asks } }),
  addTrades: (trades) => set((state) => ({
    recentTrades: [...trades, ...state.recentTrades].slice(0, 100) // Keep latest 100 trades
  })),
  updateCandle: (candle) => set((state) => {
    const existing = [...state.candles];
    if (existing.length === 0) return { candles: [candle] };
    
    const last = existing[existing.length - 1];
    if (last.time === candle.time) {
      existing[existing.length - 1] = candle;
    } else if (candle.time > last.time) {
      existing.push(candle);
    }
    
    // Keep max 1000 candles to avoid memory leaks
    if (existing.length > 1000) existing.shift();
    return { candles: existing };
  })
}));
