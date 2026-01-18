"use client";
import { useState, useEffect } from 'react';
import api from '../lib/api';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function LoanFormModal({ isOpen, onClose, onSuccess }: Props) {
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
      
      // Clear form
      setFormData({
        person_name: '',
        type: 'GIVEN',
        amount: '',
        description: '',
        date: new Date().toISOString().slice(0, 16),
      });
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      alert("Failed to log loan");
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
          <h2 className="text-2xl font-bold mb-6">Log Loan</h2>
          
          <div>
            <label className="block text-sm font-medium mb-2 opacity-80">Person Name</label>
            <input 
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={formData.person_name}
              onChange={(e) => setFormData({...formData, person_name: e.target.value})}
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 opacity-80">Type</label>
              <select 
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="GIVEN" className="bg-[#1a1a1a]">Given (I lent)</option>
                <option value="TAKEN" className="bg-[#1a1a1a]">Taken (I borrowed)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 opacity-80">Amount</label>
              <input 
                type="number" step="0.01" required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 opacity-80">Date</label>
            <input 
              type="datetime-local" required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 opacity-80">Description</label>
            <textarea 
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg hover:shadow-blue-500/20">
            Record Transaction
          </button>
        </form>
      </div>
    </div>
  );
}
