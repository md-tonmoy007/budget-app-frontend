"use client";
import { useState, useEffect } from 'react';
import api from '../lib/api';
import { X } from 'lucide-react';

interface Account {
  id: number;
  name: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ExpenseFormModal({ isOpen, onClose, onSuccess }: Props) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [formData, setFormData] = useState({
    datetime: new Date().toISOString().slice(0, 16),
    expense_type: '',
    amount: '',
    account_id: '',
    description: '',
  });

  useEffect(() => {
    if (isOpen) {
      api.get('/accounts').then(res => setAccounts(res.data)).catch(console.error);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/expenses', {
        ...formData,
        amount: parseFloat(formData.amount),
        account_id: formData.account_id ? parseInt(formData.account_id) : null,
        datetime: new Date(formData.datetime).toISOString(),
      });
      
      // Clear form
      setFormData({
        datetime: new Date().toISOString().slice(0, 16),
        expense_type: '',
        amount: '',
        account_id: '',
        description: '',
      });
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      alert("Failed to log expense");
      console.error(error);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#1a1a1a] border border-white/10 p-8 rounded-2xl w-full max-w-lg shadow-2xl relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-2xl font-bold mb-6">Log Expense</h2>
          
          <div>
            <label className="block text-sm font-medium mb-2 opacity-80">Date & Time</label>
            <input 
              type="datetime-local" 
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              value={formData.datetime}
              onChange={(e) => setFormData({...formData, datetime: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-sm font-medium mb-2 opacity-80">Type</label>
               <input 
                 type="text" 
                 placeholder="e.g. Food"
                 required
                 className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                 value={formData.expense_type}
                 onChange={(e) => setFormData({...formData, expense_type: e.target.value})}
               />
            </div>
            <div>
               <label className="block text-sm font-medium mb-2 opacity-80">Amount</label>
               <input 
                 type="number" 
                 step="0.01"
                 required
                 className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                 value={formData.amount}
                 onChange={(e) => setFormData({...formData, amount: e.target.value})}
               />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 opacity-80">Account</label>
            <select 
              required
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white"
              value={formData.account_id}
              onChange={(e) => setFormData({...formData, account_id: e.target.value})}
            >
              <option value="">Select Account</option>
              {accounts.map(acc => (
                  <option key={acc.id} value={acc.id} className="text-black">{acc.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 opacity-80">Description</label>
            <textarea 
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg hover:shadow-indigo-500/20">
            Log Expense
          </button>
        </form>
      </div>
    </div>
  );
}
