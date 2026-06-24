import { Watchlist } from '@/components/trading/Watchlist';
import { ChartContainer } from '@/components/trading/ChartContainer';
import { OrderBook } from '@/components/trading/OrderBook';
import { TradeFeed } from '@/components/trading/TradeFeed';
import { OrderForm } from '@/components/trading/OrderForm';
import { PortfolioTabs } from '@/components/trading/PortfolioTabs';
import { PriceTicker } from '@/components/trading/PriceTicker';
import { useWebSocket } from '@/hooks/useWebSocket';

export function Dashboard() {
  useWebSocket(); // Initialize WS connection

  return (
    <>
      {/* Mobile Warning Overlay */}
      <div className="lg:hidden fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Desktop Recommended</h2>
        <p className="text-muted-foreground mb-8 max-w-[300px]">
          The NanoTrade professional terminal is designed for larger screens. Please switch to a desktop or tablet for the best trading experience.
        </p>
      </div>

      <div className="hidden lg:flex h-screen w-full flex-col bg-background text-foreground overflow-hidden">
      <PriceTicker />
      
      {/* Main Grid Layout */}
      <div className="grid h-[calc(100vh-73px)] grid-cols-[250px_1fr_320px]">
        {/* Left Sidebar */}
        <div className="flex flex-col h-full border-r border-border overflow-hidden bg-card">
          <div className="flex-1 overflow-hidden">
            <Watchlist />
          </div>
        </div>

        {/* Center Main Area */}
        <div className="flex flex-col h-full overflow-hidden bg-background">
          <div className="flex-1 border-b border-border relative">
            <div className="absolute inset-0">
              <ChartContainer />
            </div>
          </div>
          <div className="h-[300px] shrink-0 bg-card border-t border-border">
            <PortfolioTabs />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="flex flex-col h-full border-l border-border overflow-hidden bg-card">
          <div className="flex-1 overflow-hidden">
            <OrderBook />
          </div>
          <div className="h-[250px] shrink-0 border-t border-border">
            <TradeFeed />
          </div>
          <div className="h-[350px] shrink-0 border-t border-border">
            <OrderForm />
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
