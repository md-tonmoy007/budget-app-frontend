"use client";
import { useState } from 'react';
import api from '../lib/api';

export default function LoanForm({ onSuccess }: { onSuccess?: () => void }) {
  const [formData, setFormData] = useState({
    person_name: '',
    type: 'GIVEN',
    amount: '',
    description: '',
    date: new Date().toISOString().slice(0, 16),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/loans', {
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString(),
      });
      
      setFormData({
        person_name: '',
        type: 'GIVEN',
        amount: '',
        description: '',
        date: new Date().toISOString().slice(0, 16),
      });
      
      if (onSuccess) onSuccess();
    } catch (error) {
      alert("Failed to log loan");
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-md">
      <h2 className="text-xl font-bold mb-6">Log Loan</h2>
      
      <div className="space-y-4">
          <div>
            <label className="block text-xs uppercase text-gray-400 mb-1">Person Name</label>
            <input 
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={formData.person_name}
              onChange={(e) => setFormData({...formData, person_name: e.target.value})}
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase text-gray-400 mb-1">Type</label>
                <select 
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                    <option value="GIVEN" className="bg-[#1a1a1a]">Given (I lent)</option>
                    <option value="TAKEN" className="bg-[#1a1a1a]">Taken (I borrowed)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase text-gray-400 mb-1">Amount</label>
                <input 
                    type="number" step="0.01" required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                />
              </div>
          </div>

          <div>
            <label className="block text-xs uppercase text-gray-400 mb-1">Date</label>
            <input 
              type="datetime-local" required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs uppercase text-gray-400 mb-1">Description</label>
            <textarea 
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all">
            Record Transaction
          </button>
      </div>
    </form>
  );
}
