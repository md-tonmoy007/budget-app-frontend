"use client";
import { useState, useEffect } from 'react';
import api from '../lib/api';
import { X, CheckCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item: {
    id: number;
    name: string;
    estimated_amount: number;
  } | null;
}

export default function BuyItemModal({ isOpen, onClose, onSuccess, item }: Props) {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    account_id: '',
    amount: '',
    date: new Date().toISOString().slice(0, 16),
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.get('/accounts').then(res => setAccounts(res.data));
      if (item) {
        setFormData(prev => ({ ...prev, amount: item.estimated_amount.toString() }));
      }
    }
  }, [isOpen, item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    
    setLoading(true);
    try {
      await api.post(`/wishlist/${item.id}/buy`, {
        account_id: parseInt(formData.account_id),
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString(),
      });
      onSuccess();
      onClose();
    } catch (error) {
      alert("Failed to record purchase");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1a1a1a] border border-white/10 p-8 rounded-2xl w-full max-w-md shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Complete Purchase</h2>
            <p className="text-gray-400 text-sm mt-1">Record buying "{item.name}"</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 opacity-80">Select Account (Deduct From)</label>
            <select 
              required
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white"
              value={formData.account_id}
              onChange={(e) => setFormData({...formData, account_id: e.target.value})}
            >
              <option value="">Select Account</option>
              {accounts.map(acc => (
                  <option key={acc.id} value={acc.id} className="text-black">
                    {acc.name} (${acc.balance.toFixed(2)})
                  </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 opacity-80">Actual Price</label>
              <input 
                type="number" step="0.01" required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 opacity-80">Date</label>
              <input 
                type="datetime-local" required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle size={20} />
            {loading ? 'Processing...' : 'Confirm Purchase'}
          </button>
        </form>
      </div>
    </div>
  );
}
