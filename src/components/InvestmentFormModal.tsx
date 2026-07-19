"use client";
import { useState, useEffect } from 'react';
import api from '../lib/api';
import { X } from 'lucide-react';
import { toLocalISOString } from '../lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  transactionToEdit?: any;
}

export default function InvestmentFormModal({ isOpen, onClose, onSuccess, transactionToEdit }: Props) {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [assetAccounts, setAssetAccounts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    account_id: '',
    asset_account_id: '',
    type: 'INVEST',
    amount: '',
    profit: '',
    description: '',
    date: toLocalISOString(new Date()),
  });

  useEffect(() => {
    if (isOpen) {
        api.get('/investments/accounts').then(res => setAccounts(res.data));
        api.get('/accounts').then(res => setAssetAccounts(res.data));

        if (transactionToEdit) {
            setFormData({
                account_id: transactionToEdit.account_id.toString(),
                asset_account_id: transactionToEdit.asset_account_id ? transactionToEdit.asset_account_id.toString() : '',
                type: transactionToEdit.type,
                amount: transactionToEdit.amount.toString(),
                profit: transactionToEdit.profit ? transactionToEdit.profit.toString() : '',
                description: transactionToEdit.description || '',
                date: toLocalISOString(new Date(transactionToEdit.date)),
            });
        }
    } else {
        // Reset form on close
        setFormData({
            account_id: '',
            asset_account_id: '',
            type: 'INVEST',
            amount: '',
            profit: '',
            description: '',
            date: toLocalISOString(new Date()),
        });
    }
  }, [isOpen, transactionToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        profit: formData.profit ? parseFloat(formData.profit) : 0,
        account_id: parseInt(formData.account_id),
        asset_account_id: formData.asset_account_id ? parseInt(formData.asset_account_id) : null,
        date: new Date(formData.date).toISOString(),
      };

      if (transactionToEdit) {
        await api.put(`/investments/transactions/${transactionToEdit.id}`, payload);
      } else {
        await api.post('/investments/transactions', payload);
      }
      
      setFormData({
        account_id: '',
        asset_account_id: '',
        type: 'INVEST',
        amount: '',
        profit: '',
        description: '',
        date: toLocalISOString(new Date()),
      });
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      alert("Failed to log transaction");
      console.error(error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1a1a1a] border border-white/10 p-8 rounded-2xl w-full max-w-lg shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-2xl font-bold mb-6">{transactionToEdit ? 'Edit Transaction' : 'Log Investment Transaction'}</h2>
          
          <div>
            <label className="block text-sm font-medium mb-2 opacity-80">Investment Account</label>
            <select 
              required
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-white"
              value={formData.account_id}
              onChange={(e) => setFormData({...formData, account_id: e.target.value})}
            >
              <option value="">Select Account</option>
              {accounts.map(acc => (
                  <option key={acc.id} value={acc.id} className="text-black">
                    {acc.company_name} ({acc.agent_name}) - {acc.status}
                  </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 opacity-80">Transaction Type</label>
              <select 
                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="INVEST" className="text-black">Invest (Add Money)</option>
                <option value="WITHDRAW" className="text-black">Withdraw (Return)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 opacity-80">Amount</label>
              <input 
                type="number" step="0.01" required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 opacity-80">Asset Account (Sync Balance)</label>
              <select 
                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-white"
                value={formData.asset_account_id}
                onChange={(e) => setFormData({...formData, asset_account_id: e.target.value})}
              >
                <option value="">No Sync</option>
                {assetAccounts.map(acc => (
                    <option key={acc.id} value={acc.id} className="text-black">
                      {acc.name} (${acc.balance.toFixed(2)})
                    </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 opacity-80">Profit (Optional)</label>
              <input 
                type="number" step="0.01"
                disabled={formData.type === 'INVEST'}
                placeholder={formData.type === 'INVEST' ? 'N/A' : '0.00'}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:opacity-50"
                value={formData.profit}
                onChange={(e) => setFormData({...formData, profit: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 opacity-80">Date</label>
            <input 
              type="datetime-local" required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 opacity-80">Description</label>
            <input 
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Optional notes"
            />
          </div>

          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-all">
            Record Transaction
          </button>
        </form>
      </div>
    </div>
  );
}
