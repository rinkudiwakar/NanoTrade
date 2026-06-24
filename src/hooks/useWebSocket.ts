import { useEffect, useRef } from 'react';
import { useMarketStore } from '@/store/marketStore';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/market';

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const setPriceUsd = useMarketStore((state) => state.setPriceUsd);
  const setOrderbook = useMarketStore((state) => state.setOrderbook);
  const addTrades = useMarketStore((state) => state.addTrades);
  
  useEffect(() => {
    function connect() {
      if (wsRef.current?.readyState === WebSocket.OPEN) return;
      
      const ws = new WebSocket(WS_URL);
      
      ws.onopen = () => {
        console.log('WebSocket connected to market stream');
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'price' || data.event === 'price') {
            const priceData = data.data || {};
            const usd = priceData.binance_price_usd || priceData.price || data.price;
            const rate = priceData.usd_inr_rate || 90;
            if (usd) setPriceUsd(usd);
            if (rate && useMarketStore.getState().setConversionRate) {
              useMarketStore.getState().setConversionRate(rate);
            }
          } else if (data.type === 'orderbook_update' || data.event === 'orderbook_update' || data.type === 'orderbook') {
            const ob = data.orderbook || data.data || data;
            if (ob && ob.bids) setOrderbook(ob.bids, ob.asks);
          } else if (data.type === 'trade_execution' || data.event === 'trade_execution' || data.type === 'trade') {
            const trade = data.trade || data.data || data;
            if (trade) addTrades(Array.isArray(trade) ? trade : [trade]);
          }
        } catch (error) {
          console.error("Failed to parse WS message", error);
        }
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected. Reconnecting in 3s...');
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        ws.close();
      };
      
      wsRef.current = ws;
    }
    
    connect();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [setPriceUsd, setOrderbook, addTrades]);
}
