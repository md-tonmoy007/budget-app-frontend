"use client";
import { useState, useEffect } from 'react';
import { X, Save, DollarSign, Calendar, FileText, Briefcase, Wallet } from 'lucide-react';
import api from '../lib/api';

interface LoanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LoanFormModal({ isOpen, onClose, onSuccess }: LoanFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [loanAccounts, setLoanAccounts] = useState<any[]>([]);
  const [assetAccounts, setAssetAccounts] = useState<any[]>([]);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [formData, setFormData] = useState({
    loan_account_id: '',
    asset_account_id: '',
    date: new Date().toISOString().split('T')[0],
    type: 'PRINCIPAL', // 'PRINCIPAL' or 'REPAYMENT'
    amount: '',
    description: ''
  });

  useEffect(() => {
    if (isOpen) {
        Promise.all([
            api.get('/loans/accounts'),
            api.get('/accounts')
        ]).then(([loanRes, assetRes]) => {
            setLoanAccounts(loanRes.data);
            setAssetAccounts(assetRes.data);
        });

        setFormData({
            loan_account_id: '',
            asset_account_id: '',
            date: new Date().toISOString().split('T')[0],
            type: 'PRINCIPAL',
            amount: '',
            description: ''
        });
        setSearchQuery('');
        setIsDropdownOpen(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.loan_account_id) {
        alert("Please select a Loan Account");
        return;
    }

    setLoading(true);
    
    try {
      await api.post('/loans/transactions', {
          ...formData,
          loan_account_id: parseInt(formData.loan_account_id),
          asset_account_id: formData.asset_account_id ? parseInt(formData.asset_account_id) : null,
          amount: parseFloat(formData.amount)
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Failed to log transaction');
    } finally {
      setLoading(false);
    }
  };

  const selectedLoanAccount = loanAccounts.find(a => a.id.toString() === formData.loan_account_id);
  const isGiven = selectedLoanAccount?.type === 'GIVEN';
  
  const getTransactionTypeLabel = (type: string) => {
      if (type === 'PRINCIPAL') {
          if(isGiven) return "Lend More";
          return "Borrow More";
      } else {
          if(isGiven) return "Collect Repayment";
          return "Make Repayment";
      }
  };

  const getAssetAccountLabel = () => {
      if (!selectedLoanAccount) return "Asset Account";
      const type = formData.type;
      
      // Logic:
      // Lend (GIVEN, PRINCIPAL) -> Withdraw from
      // Borrow (TAKEN, PRINCIPAL) -> Deposit to
      // Collect (GIVEN, REPAYMENT) -> Deposit to
      // Repay (TAKEN, REPAYMENT) -> Withdraw from
      
      if ((isGiven && type === 'PRINCIPAL') || (!isGiven && type === 'REPAYMENT')) {
          return "Withdraw From (Optional)";
      } else {
          return "Deposit To (Optional)";
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
            <h2 className="text-xl font-bold">Log Loan Transaction</h2>
            <p className="text-gray-400 text-sm mt-1">Record a new lending or repayment event</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Loan Account (Person/Entity)</label>
                <div className="relative">
                    <Briefcase className="absolute left-3 top-3 text-gray-500" size={18} />
                    <input 
                        type="text"
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-all"
                        placeholder="Search Person/Entity..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setIsDropdownOpen(true);
                            // Clear selection if typing
                            if (formData.loan_account_id) {
                                setFormData({...formData, loan_account_id: ''});
                            }
                        }}
                        onFocus={() => setIsDropdownOpen(true)}
                        // Delay blur to allow click event on options to fire
                        onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                    />
                    
                    {isDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-[#1a1b26] border border-white/10 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                            {loanAccounts
                                .filter(apiAcc => apiAcc.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map(acc => (
                                <div 
                                    key={acc.id} 
                                    className="px-4 py-2 hover:bg-white/10 cursor-pointer text-sm text-gray-200"
                                    onClick={() => {
                                        setFormData({...formData, loan_account_id: acc.id.toString()});
                                        setSearchQuery(acc.name);
                                        // setIsDropdownOpen(false); // Helper handled by Blur but instant close is good UX
                                    }}
                                >
                                    <div className="font-medium">{acc.name}</div>
                                    <div className="text-xs text-gray-500">{acc.type === 'GIVEN' ? 'Given (Lent)' : 'Taken (Borrowed)'}</div>
                                </div>
                            ))}
                            {loanAccounts.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                                <div className="px-4 py-3 text-gray-500 text-sm text-center">No accounts found</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={() => setFormData({...formData, type: 'PRINCIPAL'})}
                    className={`py-2 px-3 rounded-lg border border-transparent transition-all font-medium text-sm ${
                        formData.type === 'PRINCIPAL' 
                        ? 'bg-purple-600 text-white shadow-lg border-purple-500' 
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                >
                    {getTransactionTypeLabel('PRINCIPAL')}
                </button>
                <button
                    type="button"
                    onClick={() => setFormData({...formData, type: 'REPAYMENT'})}
                    className={`py-2 px-3 rounded-lg border border-transparent transition-all font-medium text-sm ${
                        formData.type === 'REPAYMENT' 
                        ? 'bg-emerald-600 text-white shadow-lg border-emerald-500' 
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                >
                    {getTransactionTypeLabel('REPAYMENT')}
                </button>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">{getAssetAccountLabel()}</label>
                <div className="relative">
                    <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <select
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 appearance-none"
                        value={formData.asset_account_id}
                        onChange={e => setFormData({...formData, asset_account_id: e.target.value})}
                    >
                        <option value="" className="bg-gray-800">None (Just Log)</option>
                        {assetAccounts.map(acc => (
                            <option key={acc.id} value={acc.id} className="bg-gray-800">
                                {acc.name} (${acc.balance.toFixed(2)})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Amount</label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input 
                            type="number" 
                            step="0.01"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-all font-mono"
                            placeholder="0.00"
                            value={formData.amount}
                            onChange={e => setFormData({...formData, amount: e.target.value})}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input 
                            type="date" 
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-all [color-scheme:dark]"
                            value={formData.date}
                            onChange={e => setFormData({...formData, date: e.target.value})}
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description (Optional)</label>
                <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                        type="text" 
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-all"
                        placeholder="e.g. Wire Transfer, Cash Payment"
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                </div>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 mt-2"
            >
                {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                        <Save size={18} />
                        Log Transaction
                    </>
                )}
            </button>
        </form>
      </div>
    </div>
  );
}
