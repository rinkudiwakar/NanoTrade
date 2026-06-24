import { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries, type IChartApi, type ISeriesApi } from 'lightweight-charts';
import { useMarketStore } from '@/store/marketStore';

export function ChartContainer() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  
  const currentSymbol = useMarketStore((state) => state.currentSymbol);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#848E9C', // Binance text color
      },
      grid: {
        vertLines: { color: '#2B3139', style: 1 },
        horzLines: { color: '#2B3139', style: 1 },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#0ECB81', // Binance Green
      downColor: '#F6465D', // Binance Red
      borderVisible: false,
      wickUpColor: '#0ECB81',
      wickDownColor: '#F6465D',
    });

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;
    
    // Set initial data
    const initialCandles = useMarketStore.getState().candles;
    if (initialCandles.length > 0) {
      candlestickSeries.setData(initialCandles as any);
    }

    const handleResize = () => {
      chart.applyOptions({
        width: chartContainerRef.current?.clientWidth || 0,
        height: chartContainerRef.current?.clientHeight || 0,
      });
    };

    window.addEventListener('resize', handleResize);

    // Subscribe to live updates without causing React re-renders
    const unsubscribe = useMarketStore.subscribe((state, prevState) => {
      if (state.candles !== prevState.candles && seriesRef.current) {
        const lastCandle = state.candles[state.candles.length - 1];
        if (lastCandle) {
          seriesRef.current.update(lastCandle as any);
        }
      }
    });

    return () => {
      unsubscribe();
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [currentSymbol]);

  return (
    <div className="h-full w-full flex flex-col bg-background">
      <div className="flex items-center space-x-4 p-3 border-b border-border bg-card">
        <h2 className="text-xl font-bold">{currentSymbol.replace('_', '/')}</h2>
        <div className="text-sm text-muted-foreground">1m timeframe</div>
      </div>
      <div ref={chartContainerRef} className="flex-1 w-full bg-[#0b0e11]" />
    </div>
  );
}
