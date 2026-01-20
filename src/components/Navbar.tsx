import { useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, PlusCircle, Menu, X, DollarSign, TrendingUp, Briefcase, ArrowRightLeft, ShoppingBag } from 'lucide-react';
import TransferModal from './TransferModal';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  const handleRefresh = () => {
      // Optional: if we want global refresh we need context, but for now simple callback is fine
      // Most pages fetch on mount/focus
      window.location.reload();
  };

  return (
    <>
    <nav className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              ExpenseTracker
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-4 items-center">
            <Link href="/" className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
            <button 
                onClick={() => setShowTransferModal(true)}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors text-gray-300 hover:text-white"
            >
                <ArrowRightLeft className="w-4 h-4 mr-2" />
                Transfer
            </button>
            <Link href="/log" className="flex items-center px-3 py-2 rounded-md text-sm font-medium bg-indigo-600 hover:bg-indigo-700 transition-colors">
              <PlusCircle className="w-4 h-4 mr-2" />
              Log Expense
            </Link>
            <Link href="/income" className="flex items-center px-3 py-2 rounded-md text-sm font-medium bg-green-600 hover:bg-green-700 transition-colors">
              <TrendingUp className="w-4 h-4 mr-2" />
              Add Income
            </Link>
            <Link href="/loans" className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors">
              <DollarSign className="w-4 h-4 mr-2" />
              Loans
            </Link>
            <Link href="/investments" className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors">
              <Briefcase className="w-4 h-4 mr-2" />
              Investments
            </Link>
            <Link href="/wishlist" className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Wishlist
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300 hover:text-white p-2">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-[#121212] border-b border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
             <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center px-3 py-3 rounded-md text-base font-medium hover:bg-white/10 text-gray-300 hover:text-white transition-colors">
              <LayoutDashboard className="w-5 h-5 mr-3" />
              Dashboard
            </Link>
            <button onClick={() => { setIsOpen(false); setShowTransferModal(true); }} className="w-full flex items-center px-3 py-3 rounded-md text-base font-medium hover:bg-white/10 text-gray-300 hover:text-white transition-colors text-left">
                <ArrowRightLeft className="w-5 h-5 mr-3" />
                Transfer
            </button>
            <Link href="/log" onClick={() => setIsOpen(false)} className="flex items-center px-3 py-3 rounded-md text-base font-medium hover:bg-white/10 text-gray-300 hover:text-white transition-colors">
              <PlusCircle className="w-5 h-5 mr-3" />
              Log Expense
            </Link>
            <Link href="/income" onClick={() => setIsOpen(false)} className="flex items-center px-3 py-3 rounded-md text-base font-medium hover:bg-white/10 text-gray-300 hover:text-white transition-colors">
              <TrendingUp className="w-5 h-5 mr-3" />
              Add Income
            </Link>
            <Link href="/loans" onClick={() => setIsOpen(false)} className="flex items-center px-3 py-3 rounded-md text-base font-medium hover:bg-white/10 text-gray-300 hover:text-white transition-colors">
              <DollarSign className="w-5 h-5 mr-3" />
              Loans
            </Link>
            <Link href="/investments" onClick={() => setIsOpen(false)} className="flex items-center px-3 py-3 rounded-md text-base font-medium hover:bg-white/10 text-gray-300 hover:text-white transition-colors">
              <Briefcase className="w-5 h-5 mr-3" />
              Investments
            </Link>
            <Link href="/wishlist" onClick={() => setIsOpen(false)} className="flex items-center px-3 py-3 rounded-md text-base font-medium hover:bg-white/10 text-gray-300 hover:text-white transition-colors">
              <ShoppingBag className="w-5 h-5 mr-3" />
              Wishlist
            </Link>
          </div>
        </div>
      )}
    </nav>
    
    <TransferModal 
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        onSuccess={handleRefresh}
    />
    </>
  );
}
