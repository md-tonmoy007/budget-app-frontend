"use client";
import { useState, useEffect } from 'react';
import { X, Save, User, Wallet } from 'lucide-react';
import api from '../lib/api';

interface LoanAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  account?: any;
}

export default function LoanAccountModal({ isOpen, onClose, onSuccess, account }: LoanAccountModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'GIVEN', // 'GIVEN' or 'TAKEN'
    status: 'ACTIVE'
  });

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name,
        type: account.type,
        status: account.status
      });
    } else {
      setFormData({
        name: '',
        type: 'GIVEN',
        status: 'ACTIVE'
      });
    }
  }, [account, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (account) {
        await api.put(`/loans/accounts/${account.id}`, formData);
      } else {
        await api.post('/loans/accounts', formData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Failed to save account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1a1b26] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
            <X size={20} />
        </button>

        <div className="mb-6">
            <h2 className="text-xl font-bold">{account ? 'Edit Loan Account' : 'New Loan Account'}</h2>
            <p className="text-gray-400 text-sm mt-1">
                {account ? 'Update account details' : 'Create a new profile for tracking loans'}
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Account Name</label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                        type="text" 
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        placeholder="e.g. John Doe, Chase Bank"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
                <div className="grid grid-cols-2 gap-3 bg-white/5 p-1 rounded-lg border border-white/10">
                    <button
                        type="button"
                        onClick={() => setFormData({...formData, type: 'GIVEN'})}
                        className={`py-2 px-3 rounded-md text-sm font-medium transition-all ${
                            formData.type === 'GIVEN'
                            ? 'bg-emerald-600 text-white shadow-lg'
                            : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        GIVEN (I Lent)
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData({...formData, type: 'TAKEN'})}
                        className={`py-2 px-3 rounded-md text-sm font-medium transition-all ${
                            formData.type === 'TAKEN'
                            ? 'bg-rose-600 text-white shadow-lg'
                            : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        TAKEN (I Borrowed)
                    </button>
                </div>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                <select
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-indigo-500 appearance-none"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                >
                    <option value="ACTIVE" className="bg-gray-800">Active</option>
                    <option value="SETTLED" className="bg-gray-800">Settled (Closed)</option>
                </select>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 mt-4"
            >
                {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                        <Save size={18} />
                        {account ? 'Update Account' : 'Create Account'}
                    </>
                )}
            </button>
        </form>
      </div>
    </div>
  );
}
