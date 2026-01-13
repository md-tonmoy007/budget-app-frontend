"use client";
import { useState, useEffect } from 'react';
import api from '../lib/api';

interface Account {
  id: number;
  name: string;
}

interface Expense {
  id: number;
  datetime: string;
  expense_type: string;
  amount: number;
  account_id: number;
  description: string;
}

interface Props {
  expense: Expense;
  onClose: () => void;
  onUpdate: () => void;
}

export default function EditExpenseModal({ expense, onClose, onUpdate }: Props) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [formData, setFormData] = useState({
    datetime: expense.datetime ? new Date(expense.datetime).toISOString().slice(0, 16) : '',
    expense_type: expense.expense_type,
    amount: expense.amount,
    account_id: expense.account_id,
    description: expense.description || '',
  });

  useEffect(() => {
    api.get('/accounts').then(res => setAccounts(res.data)).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/expenses/${expense.id}`, {
        ...formData,
        amount: Number(formData.amount),
        account_id: formData.account_id ? Number(formData.account_id) : null,
        datetime: new Date(formData.datetime).toISOString(),
      });
      onUpdate();
      onClose();
    } catch (error) {
        console.error("Failed to update expense", error);
        alert("Failed to update expense");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1a1a1a] border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
        <h2 className="text-xl font-bold mb-4">Edit Expense</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs uppercase text-gray-400 mb-1">Date</label>
                <input 
                  type="datetime-local" 
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.datetime}
                  onChange={(e) => setFormData({...formData, datetime: e.target.value})}
                />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
                <div>
                   <label className="block text-xs uppercase text-gray-400 mb-1">Type</label>
                   <input 
                     type="text" 
                     className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     value={formData.expense_type}
                     onChange={(e) => setFormData({...formData, expense_type: e.target.value})}
                   />
                </div>
                <div>
                   <label className="block text-xs uppercase text-gray-400 mb-1">Amount</label>
                   <input 
                     type="number" step="0.01"
                     className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     value={formData.amount}
                     onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                   />
                </div>
            </div>

            <div>
                <label className="block text-xs uppercase text-gray-400 mb-1">Account</label>
                <select 
                  className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.account_id || ''}
                  onChange={(e) => setFormData({...formData, account_id: Number(e.target.value)})}
                >
                    <option value="">Select Account</option>
                    {accounts.map(acc => (
                        <option key={acc.id} value={acc.id} className="text-black">{acc.name}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-xs uppercase text-gray-400 mb-1">Description</label>
                <textarea 
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
            </div>
            
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded transition-colors">
                Save Changes
            </button>
        </form>
      </div>
    </div>
  );
}
