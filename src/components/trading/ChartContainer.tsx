import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries, type IChartApi, type ISeriesApi, type UTCTimestamp } from 'lightweight-charts';
import { useMarketStore } from '@/store/marketStore';

type CandleData = {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

// Fetch last 200 1-minute candles from Binance US for seeding the chart
async function fetchHistoricalCandles(conversionRate: number): Promise<CandleData[]> {
  try {
    const resp = await fetch(
      'https://api.binance.us/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=200'
    );
    if (!resp.ok) throw new Error('Failed to fetch klines');
    const raw: [number, string, string, string, string, string][] = await resp.json();
    return raw.map(([t, o, h, l, c, v]) => ({
      time: Math.floor(t / 1000) as UTCTimestamp,
      open: parseFloat(o) * conversionRate,
      high: parseFloat(h) * conversionRate,
      low: parseFloat(l) * conversionRate,
      close: parseFloat(c) * conversionRate,
      volume: parseFloat(v),
    }));
  } catch {
    return [];
  }
}

export function ChartContainer() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentSymbol = useMarketStore((state) => state.currentSymbol);

  // Fullscreen event listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      wrapperRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0b0e11' },
        textColor: '#848E9C',
      },
      grid: {
        vertLines: { color: '#1E2329', style: 1 },
        horzLines: { color: '#1E2329', style: 1 },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#2B3139',
      },
      rightPriceScale: {
        borderColor: '#2B3139',
      },
      crosshair: {
        mode: 1,
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#0ECB81',
      downColor: '#F6465D',
      borderVisible: false,
      wickUpColor: '#0ECB81',
      wickDownColor: '#F6465D',
    });

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    // 1. If we have persisted candles, use them immediately
    const persistedCandles = useMarketStore.getState().candles;
    if (persistedCandles.length > 0 && seriesRef.current) {
      seriesRef.current.setData(persistedCandles.map(c => ({ ...c, time: c.time as unknown as UTCTimestamp })));
      chart.timeScale().fitContent();
    } else {
      // 2. Otherwise fetch the real conversion rate from backend, then seed from Binance REST
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      fetch(`${apiUrl}/api/v1/market/price`)
        .then(r => r.json())
        .then(data => {
          const rate = data.usd_inr_rate || 90;
          useMarketStore.getState().setConversionRate(rate);
          return fetchHistoricalCandles(rate);
        })
        .then((candles) => {
          if (candles.length > 0 && seriesRef.current) {
            seriesRef.current.setData(candles);
            chart.timeScale().fitContent();
            // Store the seed in state so it gets persisted
            candles.forEach(c => useMarketStore.getState().updateCandle(c));
          }
        })
        .catch(console.error);
    }

    const handleResize = () => {
      if (!chartContainerRef.current) return;
      chart.applyOptions({
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight,
      });
    };

    window.addEventListener('resize', handleResize);

    // Subscribe to live kline updates from WebSocket
    const unsubscribe = useMarketStore.subscribe((state, prevState) => {
      if (state.candles !== prevState.candles && state.candles.length > 0 && seriesRef.current) {
        const lastCandle = state.candles[state.candles.length - 1];
        if (lastCandle) {
          seriesRef.current.update({ ...lastCandle, time: lastCandle.time as unknown as UTCTimestamp });
        }
      }
    });

    return () => {
      unsubscribe();
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [currentSymbol]);

  return (
    <div ref={wrapperRef} className="h-full w-full flex flex-col" style={{ background: '#0b0e11' }}>
      <div className="flex items-center gap-4 px-4 py-2 border-b border-[#1E2329]" style={{ background: '#0b0e11' }}>
        <h2 className="text-base font-bold text-white">{currentSymbol.replace('_', '/')}</h2>
        <div className="text-xs text-[#848E9C]">1m timeframe</div>
        <div className="ml-auto flex items-center gap-2 text-xs text-[#848E9C]">
          {['1m', '5m', '15m', '1h', '4h', '1D'].map((tf) => (
            <button
              key={tf}
              className="px-2 py-1 rounded hover:bg-[#1E2329] hover:text-white transition-colors"
            >
              {tf}
            </button>
          ))}
          <div className="w-px h-4 bg-[#2B3139] mx-1"></div>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded hover:bg-[#1E2329] hover:text-white transition-colors flex items-center justify-center"
            title={isFullscreen ? "Exit Fullscreen" : "Expand Chart"}
          >
            {isFullscreen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
            )}
          </button>
        </div>
      </div>
      <div ref={chartContainerRef} className="flex-1 w-full" />
    </div>
  );
}
