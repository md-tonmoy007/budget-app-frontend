"use client";
import { useState } from 'react';
import api from '../lib/api';

interface Account {
  id: number;
  name: string;
  type: string;
}

interface Props {
  account: Account;
  onClose: () => void;
  onUpdate: () => void;
}

export default function EditAccountModal({ account, onClose, onUpdate }: Props) {
  const [name, setName] = useState(account.name);
  const [type, setType] = useState(account.type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/accounts/${account.id}`, { name, type });
      onUpdate();
      onClose();
    } catch (error) {
        console.error("Failed to update account", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1a1a1a] border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
        <h2 className="text-lg font-bold mb-4">Edit Account</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs uppercase text-gray-400 mb-1">Account Name</label>
                <input 
                  type="text" 
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
            </div>
            
            <div>
                <label className="block text-xs uppercase text-gray-400 mb-1">Type</label>
                <select 
                  className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option>Bank</option>
                  <option>Cash</option>
                  <option>Credit Card</option>
                  <option>Digital Wallet</option>
                </select>
            </div>

            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded transition-colors">
                Save
            </button>
        </form>
      </div>
    </div>
  );
}
