"use client";
import { useState, useEffect } from 'react';
import api from '../lib/api';

interface Account {
  id: number;
  name: string;
}

export default function ExpenseForm({ onSuccess }: { onSuccess?: () => void }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [formData, setFormData] = useState({
    datetime: new Date().toISOString().slice(0, 16),
    expense_type: '',
    amount: '',
    account_id: '',
    description: '',
  });

  useEffect(() => {
    // Fetch accounts for the dropdown
    api.get('/accounts').then(res => setAccounts(res.data)).catch(console.error);
  }, []);

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
    } catch (error) {
      alert("Failed to log expense");
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-md max-w-lg mx-auto">
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
  );
}
