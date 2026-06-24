import React, { useState } from 'react';
import { useMarketStore } from '@/store/marketStore';
import { api } from '@/services/api';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function OrderForm() {
  const currentSymbol = useMarketStore((state) => state.currentSymbol);
  const priceUsd = useMarketStore((state) => state.priceUsd);
  const conversionRate = useMarketStore((state) => state.conversionRate);
  
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [type, setType] = useState<'LIMIT' | 'MARKET'>('LIMIT');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  
  const currentPriceInr = priceUsd * conversionRate;
  const baseCurrency = currentSymbol.split('_')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        symbol: currentSymbol,
        side,
        type,
        quantity: parseFloat(quantity),
        price: type === 'LIMIT' ? parseFloat(price) : currentPriceInr,
      };
      await api.post('/orders', payload);
      toast.success('Order placed successfully!', {
        description: `Your ${side} order for ${quantity} ${baseCurrency} was executed.`,
      });
      // Reset form
      setQuantity('');
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Failed to place order.';
      toast.error('Order failed', {
        description: msg,
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-card p-4 text-sm font-sans">
      <div className="flex gap-2 mb-4">
        <Button 
          variant={side === 'BUY' ? 'default' : 'outline'} 
          className={side === 'BUY' ? 'bg-[#0ECB81] text-white hover:bg-[#0ECB81]/90 flex-1 rounded-sm font-semibold' : 'flex-1 rounded-sm bg-transparent border-transparent hover:bg-accent hover:text-white text-muted-foreground'}
          onClick={() => setSide('BUY')}
        >Buy</Button>
        <Button 
          variant={side === 'SELL' ? 'default' : 'outline'} 
          className={side === 'SELL' ? 'bg-[#F6465D] text-white hover:bg-[#F6465D]/90 flex-1 rounded-sm font-semibold' : 'flex-1 rounded-sm bg-transparent border-transparent hover:bg-accent hover:text-white text-muted-foreground'}
          onClick={() => setSide('SELL')}
        >Sell</Button>
      </div>
      
      <Tabs value={type} onValueChange={(v) => setType(v as 'LIMIT' | 'MARKET')} className="w-full">
        <TabsList className="w-full grid grid-cols-2 mb-4 bg-transparent p-0 border-b border-border rounded-none h-auto">
          <TabsTrigger value="LIMIT" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-white text-muted-foreground border-b-2 border-transparent data-[state=active]:border-[#FCD535] rounded-none px-0 pb-2">Limit</TabsTrigger>
          <TabsTrigger value="MARKET" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-white text-muted-foreground border-b-2 border-transparent data-[state=active]:border-[#FCD535] rounded-none px-0 pb-2">Market</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1">
        {type === 'LIMIT' && (
          <div className="flex items-center bg-[#2B3139] rounded-md px-3 py-1 focus-within:ring-1 ring-[#FCD535]">
            <span className="text-muted-foreground text-xs mr-2">Price</span>
            <Input 
              type="number" 
              step="0.01" 
              value={price} 
              onChange={e => setPrice(e.target.value)} 
              placeholder={currentPriceInr.toFixed(2)} 
              required={type === 'LIMIT'}
              className="bg-transparent border-none text-right focus-visible:ring-0 px-0 shadow-none text-white h-8"
            />
            <span className="text-muted-foreground text-xs ml-2">INR</span>
          </div>
        )}
        
        <div className="flex items-center bg-[#2B3139] rounded-md px-3 py-1 focus-within:ring-1 ring-[#FCD535]">
          <span className="text-muted-foreground text-xs mr-2">Amount</span>
          <Input 
            type="number" 
            step="0.0001" 
            value={quantity} 
            onChange={e => setQuantity(e.target.value)} 
            placeholder="0.00" 
            required
            className="bg-transparent border-none text-right focus-visible:ring-0 px-0 shadow-none text-white h-8"
          />
          <span className="text-muted-foreground text-xs ml-2">{baseCurrency}</span>
        </div>

        <div className="flex gap-1 mt-2">
          {['25%', '50%', '75%', '100%'].map(pct => (
            <div key={pct} className="flex-1 text-center bg-[#2B3139] hover:bg-[#374151] cursor-pointer text-xs py-1 rounded-sm text-muted-foreground hover:text-white transition-colors">
              {pct}
            </div>
          ))}
        </div>
        
        <div className="mt-auto pt-4">
          <Button type="submit" className={`w-full py-6 rounded-sm font-bold text-base ${side === 'BUY' ? 'bg-[#0ECB81] hover:bg-[#0ECB81]/90 text-white' : 'bg-[#F6465D] hover:bg-[#F6465D]/90 text-white'}`}>
            {side === 'BUY' ? 'Buy' : 'Sell'} {baseCurrency}
          </Button>
        </div>
      </form>
    </div>
  );
}
