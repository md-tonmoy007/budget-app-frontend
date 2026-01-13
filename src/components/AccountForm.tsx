"use client";
import { useState } from 'react';
import api from '../lib/api';

export default function AccountForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('Bank');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/accounts', { name, type });
      setName('');
      onSuccess();
    } catch (error) {
      console.error("Failed to create account", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex gap-4 items-end">
      <div className="flex-1">
        <label className="block text-xs uppercase text-gray-400 mb-1">Account Name</label>
        <input 
          value={name} onChange={(e) => setName(e.target.value)} required
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="e.g. Chase Checking"
        />
      </div>
      <div>
        <label className="block text-xs uppercase text-gray-400 mb-1">Type</label>
        <select 
          value={type} onChange={(e) => setType(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option>Bank</option>
          <option>Cash</option>
          <option>Credit Card</option>
          <option>Digital Wallet</option>
        </select>
      </div>
      <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
        Add
      </button>
    </form>
  );
}
