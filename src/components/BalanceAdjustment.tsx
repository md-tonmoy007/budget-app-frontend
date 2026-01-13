"use client";
import { useState } from 'react';
import api from '../lib/api';
import { DollarSign } from 'lucide-react';

interface Props {
  accountId: number;
  currentBalance: number;
  onUpdate: () => void;
}

export default function BalanceAdjustment({ accountId, currentBalance, onUpdate }: Props) {
  const [amount, setAmount] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        // float conversion
      await api.put(`/accounts/${accountId}/balance?amount=${amount}`);
      setAmount('');
      setIsOpen(false);
      onUpdate();
    } catch (error) {
      console.error("Failed to adjust balance", error);
    }
  };

  if (!isOpen) {
    return (
        <button onClick={() => setIsOpen(true)} className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition-colors text-indigo-300">
            Adjust
        </button>
    );
  }

  return (
    <form onSubmit={handleAdjust} className="flex items-center gap-2 mt-1">
      <input 
        type="number" 
        step="0.01" 
        value={amount} 
        onChange={e => setAmount(e.target.value)}
        placeholder="+/- Amount"
        className="w-24 bg-black/20 text-xs px-2 py-1 rounded border border-white/10"
        autoFocus
      />
      <button type="submit" className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded hover:bg-green-500/30">Save</button>
      <button type="button" onClick={() => setIsOpen(false)} className="text-xs bg-red-500/10 text-red-300 px-2 py-1 rounded hover:bg-red-500/20">X</button>
    </form>
  );
}
