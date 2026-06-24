import React, { useState } from 'react';
import { useMarketStore } from '@/store/marketStore';
import { useUserStore } from '@/store/userStore';
import { api } from '@/services/api';
import { toast } from 'sonner';

export function OrderForm() {
  const currentSymbol = useMarketStore((state) => state.currentSymbol);
  const priceUsd = useMarketStore((state) => state.priceUsd);
  const conversionRate = useMarketStore((state) => state.conversionRate);

  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [type, setType] = useState<'LIMIT' | 'MARKET'>('LIMIT');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);

  const currentPriceInr = priceUsd * conversionRate;
  const baseCurrency = currentSymbol.split('_')[0];
  const { fetchPortfolio, fetchOrders } = useUserStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(quantity);
    const prc = type === 'LIMIT' ? parseFloat(price) : currentPriceInr;

    if (isNaN(qty) || qty <= 0) {
      toast.error('Invalid quantity', { description: 'Please enter a positive amount.' });
      return;
    }
    if (type === 'LIMIT' && (isNaN(prc) || prc <= 0)) {
      toast.error('Invalid price', { description: 'Please enter a valid price.' });
      return;
    }

    // Round to backend-accepted precision: price to 2dp, quantity to 6dp
    const roundedPrice = Math.round(prc * 100) / 100;
    const roundedQty = Math.round(qty * 1_000_000) / 1_000_000;

    setLoading(true);
    try {
      await api.post('/orders', {
        side,
        price: roundedPrice,
        quantity: roundedQty,
      });
      toast.success(`${side} order placed!`, {
        description: `${roundedQty} ${baseCurrency} @ ₹${roundedPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
      });
      setQuantity('');
      if (type === 'LIMIT') setPrice('');
      
      // Instantly refresh margin and orders list
      fetchPortfolio();
      fetchOrders();
    } catch (error: any) {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        'Failed to place order. Check your balance.';
      toast.error('Order failed', { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-3 text-sm font-sans gap-3" style={{ background: '#161A1E' }}>
      {/* Buy / Sell Toggle */}
      <div className="flex gap-1 rounded overflow-hidden border border-[#2B3139]">
        <button
          onClick={() => setSide('BUY')}
          className={`flex-1 py-2 font-semibold text-sm transition-colors ${
            side === 'BUY'
              ? 'bg-[#0ECB81] text-white'
              : 'text-[#848E9C] hover:text-white hover:bg-[#2B3139]'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setSide('SELL')}
          className={`flex-1 py-2 font-semibold text-sm transition-colors ${
            side === 'SELL'
              ? 'bg-[#F6465D] text-white'
              : 'text-[#848E9C] hover:text-white hover:bg-[#2B3139]'
          }`}
        >
          Sell
        </button>
      </div>

      {/* Limit / Market Toggle */}
      <div className="flex gap-3 border-b border-[#2B3139] pb-2">
        {(['LIMIT', 'MARKET'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`text-sm pb-1 font-medium transition-colors border-b-2 ${
              type === t
                ? 'text-white border-[#FCD535]'
                : 'text-[#848E9C] border-transparent hover:text-white'
            }`}
          >
            {t.charAt(0) + t.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 flex-1">
        {/* Price input (Limit only) */}
        {type === 'LIMIT' && (
          <div>
            <label className="text-[10px] text-[#848E9C] uppercase tracking-wider mb-1 block">Price (INR)</label>
            <div className="flex items-center bg-[#1E2329] border border-[#2B3139] rounded px-3 h-10 focus-within:border-[#FCD535] transition-colors">
              <input
                type="number"
                step="1"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={currentPriceInr > 0 ? Math.round(currentPriceInr).toString() : '0'}
                className="flex-1 bg-transparent text-right text-white text-sm outline-none placeholder-[#4B5563]"
              />
              <span className="text-[#848E9C] text-xs ml-2">INR</span>
            </div>
          </div>
        )}

        {type === 'MARKET' && (
          <div className="flex items-center bg-[#1E2329] border border-[#2B3139] rounded px-3 h-10">
            <span className="text-[#848E9C] text-xs">Market Price</span>
            <span className="ml-auto text-sm text-white font-medium">
              ₹{currentPriceInr > 0 ? Math.round(currentPriceInr).toLocaleString('en-IN') : '---'}
            </span>
          </div>
        )}

        {/* Amount input */}
        <div>
          <label className="text-[10px] text-[#848E9C] uppercase tracking-wider mb-1 block">Amount ({baseCurrency})</label>
          <div className="flex items-center bg-[#1E2329] border border-[#2B3139] rounded px-3 h-10 focus-within:border-[#FCD535] transition-colors">
            <input
              type="number"
              step="0.0001"
              min="0.0001"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0.0000"
              className="flex-1 bg-transparent text-right text-white text-sm outline-none placeholder-[#4B5563]"
            />
            <span className="text-[#848E9C] text-xs ml-2">{baseCurrency}</span>
          </div>
        </div>

        {/* Order cost estimate */}
        {quantity && (
          <div className="flex justify-between text-xs text-[#848E9C] bg-[#1E2329] rounded px-3 py-2">
            <span>Est. Total</span>
            <span className="text-white font-medium">
              ₹{(
                parseFloat(quantity || '0') *
                (type === 'LIMIT' ? parseFloat(price || '0') : currentPriceInr)
              ).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </span>
          </div>
        )}

        {/* Quick % buttons */}
        <div className="flex gap-1">
          {['25%', '50%', '75%', '100%'].map((pct) => (
            <button
              key={pct}
              type="button"
              className="flex-1 text-center bg-[#1E2329] border border-[#2B3139] hover:border-[#848E9C] cursor-pointer text-xs py-1.5 rounded text-[#848E9C] hover:text-white transition-colors"
            >
              {pct}
            </button>
          ))}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded font-bold text-white text-sm mt-auto transition-opacity disabled:opacity-60 ${
            side === 'BUY'
              ? 'bg-[#0ECB81] hover:bg-[#0ECB81]/90'
              : 'bg-[#F6465D] hover:bg-[#F6465D]/90'
          }`}
        >
          {loading ? 'Placing...' : `${side === 'BUY' ? 'Buy' : 'Sell'} ${baseCurrency}`}
        </button>
      </form>
    </div>
  );
}
