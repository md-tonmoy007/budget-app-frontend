"use client";
import { useState } from 'react';
import Navbar from '../../components/Navbar';
import WishlistForm from '../../components/WishlistForm';
import WishlistList from '../../components/WishlistList';
import { ShoppingBag } from 'lucide-react';

export default function WishlistPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
            <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    Wishlist
                </h1>
                <p className="text-gray-400 mt-2">Plan your future purchases and track your savings goal.</p>
            </div>
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-6 py-4">
                <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
                    <ShoppingBag size={24} />
                </div>
                <div>
                    <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Planned Spend</p>
                    <p className="text-xl font-black text-white">Future Goals</p>
                </div>
            </div>
        </div>

        <WishlistForm onSuccess={handleRefresh} />
        <WishlistList refreshKey={refreshKey} onPurchase={handleRefresh} />
      </div>
    </main>
  );
}
