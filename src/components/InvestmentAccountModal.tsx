"use client";
import { useState, useEffect } from 'react';
import api from '../lib/api';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  account?: any; // If provided, we are in edit mode
}

export default function InvestmentAccountModal({ isOpen, onClose, onSuccess, account }: Props) {
  const [formData, setFormData] = useState({
    company_name: '',
    agent_name: '',
    status: 'ACTIVE',
  });

  // Populate form when account changes
  useEffect(() => {
    if (account) {
      setFormData({
        company_name: account.company_name,
        agent_name: account.agent_name,
        status: account.status || 'ACTIVE',
      });
    } else {
      setFormData({ company_name: '', agent_name: '', status: 'ACTIVE' });
    }
  }, [account, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (account) {
        await api.put(`/investments/accounts/${account.id}`, formData);
      } else {
        await api.post('/investments/accounts', formData);
      }
      
      setFormData({ company_name: '', agent_name: '', status: 'ACTIVE' });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      alert("Failed to save investment account");
      console.error(error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1a1a1a] border border-white/10 p-8 rounded-2xl w-full max-w-md shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-2xl font-bold mb-6">{account ? 'Edit Account' : 'New Investment Account'}</h2>
          
          <div>
            <label className="block text-sm font-medium mb-2 opacity-80">Company Name</label>
            <input 
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-white"
              value={formData.company_name}
              onChange={(e) => setFormData({...formData, company_name: e.target.value})}
              placeholder="e.g. Acme Corp"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 opacity-80">Agent Name</label>
            <input 
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-white"
              value={formData.agent_name}
              onChange={(e) => setFormData({...formData, agent_name: e.target.value})}
              placeholder="e.g. John Agent"
            />
          </div>

          {account && (
              <div>
                <label className="block text-sm font-medium mb-2 opacity-80">Status</label>
                <select 
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="ACTIVE" className="text-black">ACTIVE</option>
                  <option value="CLOSED" className="text-black">CLOSED</option>
                </select>
              </div>
          )}

          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-all">
            {account ? 'Update Account' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
