import { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries, type IChartApi, type ISeriesApi, type UTCTimestamp } from 'lightweight-charts';
import { useMarketStore } from '@/store/marketStore';

type CandleData = {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
};

// Fetch last 200 1-minute candles from Binance US for seeding the chart
async function fetchHistoricalCandles(conversionRate: number): Promise<CandleData[]> {
  try {
    const resp = await fetch(
      'https://api.binance.us/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=200'
    );
    if (!resp.ok) throw new Error('Failed to fetch klines');
    const raw: [number, string, string, string, string][] = await resp.json();
    return raw.map(([t, o, h, l, c]) => ({
      time: Math.floor(t / 1000) as UTCTimestamp,
      open: parseFloat(o) * conversionRate,
      high: parseFloat(h) * conversionRate,
      low: parseFloat(l) * conversionRate,
      close: parseFloat(c) * conversionRate,
    }));
  } catch {
    return [];
  }
}

export function ChartContainer() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  const currentSymbol = useMarketStore((state) => state.currentSymbol);
  const conversionRate = useMarketStore((state) => state.conversionRate);

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

    // Seed chart with historical candles (converted to INR) immediately
    const rate = conversionRate > 1 ? conversionRate : useMarketStore.getState().conversionRate || 90;
    fetchHistoricalCandles(rate).then((candles) => {
      if (candles.length > 0 && seriesRef.current) {
        seriesRef.current.setData(candles);
        chart.timeScale().fitContent();
      }
    });

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
      if (state.candles !== prevState.candles && seriesRef.current) {
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
    <div className="h-full w-full flex flex-col" style={{ background: '#0b0e11' }}>
      <div className="flex items-center gap-4 px-4 py-2 border-b border-[#1E2329]" style={{ background: '#0b0e11' }}>
        <h2 className="text-base font-bold text-white">{currentSymbol.replace('_', '/')}</h2>
        <div className="text-xs text-[#848E9C]">1m timeframe</div>
        <div className="ml-auto flex gap-2 text-xs text-[#848E9C]">
          {['1m', '5m', '15m', '1h', '4h', '1D'].map((tf) => (
            <button
              key={tf}
              className="px-2 py-1 rounded hover:bg-[#1E2329] hover:text-white transition-colors"
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      <div ref={chartContainerRef} className="flex-1 w-full" />
    </div>
  );
}
