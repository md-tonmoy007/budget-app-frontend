"use client";
import { useState, useEffect } from 'react';
import { X, ArrowRightLeft, DollarSign, Wallet } from 'lucide-react';
import api from '../lib/api';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TransferModal({ isOpen, onClose, onSuccess }: TransferModalProps) {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    from_account_id: '',
    to_account_id: '',
    amount: '',
    description: ''
  });

  useEffect(() => {
    if (isOpen) {
      api.get('/accounts').then(res => setAccounts(res.data));
      setFormData({
        from_account_id: '',
        to_account_id: '',
        amount: '',
        description: ''
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.from_account_id === formData.to_account_id) {
        alert("Source and Destination accounts cannot be the same.");
        return;
    }
    
    setLoading(true);
    try {
      await api.post('/accounts/transfer', {
          ...formData,
          from_account_id: parseInt(formData.from_account_id),
          to_account_id: parseInt(formData.to_account_id),
          amount: parseFloat(formData.amount)
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.detail || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1a1b26] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
            <X size={20} />
        </button>

        <div className="mb-6 flex items-center gap-3">
            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
                <ArrowRightLeft size={24} />
            </div>
            <div>
                <h2 className="text-xl font-bold">Transfer Money</h2>
                <p className="text-gray-400 text-sm">Move funds between your accounts</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
                {/* From Account */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">From</label>
                    <div className="relative">
                        <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <select
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 appearance-none"
                            value={formData.from_account_id}
                            onChange={e => setFormData({...formData, from_account_id: e.target.value})}
                        >
                            <option value="" className="bg-gray-800">Select Source Account</option>
                            {accounts.map(acc => (
                                <option key={acc.id} value={acc.id} className="bg-gray-800">
                                    {acc.name} (${acc.balance.toFixed(2)})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Arrow Visual */}
                <div className="flex justify-center -my-2 text-gray-500">
                    <ArrowRightLeft size={16} className="rotate-90" />
                </div>

                {/* To Account */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">To</label>
                    <div className="relative">
                        <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <select
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 appearance-none"
                            value={formData.to_account_id}
                            onChange={e => setFormData({...formData, to_account_id: e.target.value})}
                        >
                            <option value="" className="bg-gray-800">Select Destination Account</option>
                            {accounts.filter(a => a.id.toString() !== formData.from_account_id).map(acc => (
                                <option key={acc.id} value={acc.id} className="bg-gray-800">
                                    {acc.name} (${acc.balance.toFixed(2)})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Amount</label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                        type="number" 
                        step="0.01"
                        required
                        min="0.01"
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 font-mono text-lg transition-all"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={e => setFormData({...formData, amount: e.target.value})}
                    />
                </div>
            </div>

            <div>
                 <label className="block text-sm font-medium text-gray-400 mb-1">Note (Optional)</label>
                 <input 
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-indigo-500 transition-all"
                    placeholder="e.g. Savings allocation"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                 />
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 mt-4 text-base"
            >
                {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                        Transfer Funds
                    </>
                )}
            </button>
        </form>
      </div>
    </div>
  );
}
