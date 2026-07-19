"use client";
import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Trash2, ShoppingCart, ExternalLink, Tag } from 'lucide-react';
import BuyItemModal from './BuyItemModal';

export default function WishlistList({ refreshKey, onPurchase }: { refreshKey: number, onPurchase: () => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [refreshKey]);

  const fetchItems = async () => {
    try {
      const res = await api.get('/wishlist/');
      setItems(res.data);
    } catch (error) {
      console.error("Failed to fetch wishlist", error);
    }
  };

  const handleDelete = async (id: number) => {
    if(!confirm("Remove this item?")) return;
    try {
      await api.delete(`/wishlist/${id}`);
      fetchItems();
    } catch (error) {
      console.error(error);
    }
  };

  const priorityColor = (p: string) => {
    switch(p) {
      case 'High': return 'text-red-400 bg-red-400/10';
      case 'Medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'Low': return 'text-blue-400 bg-blue-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const activeItems = items.filter(i => i.status === 'PENDING');
  const boughtItems = items.filter(i => i.status === 'BOUGHT');

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Tag size={20} className="text-indigo-400" />
            Active Wishlist ({activeItems.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeItems.length === 0 && (
            <p className="text-gray-500 col-span-full py-12 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
              No items in your wishlist yet.
            </p>
          )}
          {activeItems.map(item => (
            <div key={item.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-all group">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${priorityColor(item.priority)}`}>
                  {item.priority} Priority
                </span>
                <div className="flex gap-2">
                   {item.link && (
                     <a href={item.link} target="_blank" rel="noreferrer" className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-all">
                        <ExternalLink size={16} />
                     </a>
                   )}
                   <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-500/20 rounded-full text-gray-400 hover:text-red-400 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                      <Trash2 size={16} />
                   </button>
                </div>
              </div>
              
              <h4 className="text-lg font-bold mb-1">{item.name}</h4>
              <p className="text-2xl font-black text-white mb-4">${item.estimated_amount.toFixed(2)}</p>
              
              <button 
                onClick={() => { setSelectedItem(item); setShowBuyModal(true); }}
                className="w-full bg-white text-black font-bold py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-400 transition-all"
              >
                <ShoppingCart size={18} />
                Buy Item
              </button>
            </div>
          ))}
        </div>
      </div>

      {boughtItems.length > 0 && (
        <div className="opacity-60">
            <h3 className="text-lg font-bold mb-4">Recently Bought</h3>
            <div className="space-y-2">
                {boughtItems.slice(0, 5).map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-3">
                            <span className="text-emerald-400"><Tag size={14}/></span>
                            <span className="line-through">{item.name}</span>
                        </div>
                        <span className="font-mono text-sm">${item.estimated_amount.toFixed(2)}</span>
                    </div>
                ))}
            </div>
        </div>
      )}

      <BuyItemModal 
        isOpen={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        onSuccess={() => { fetchItems(); onPurchase(); }}
        item={selectedItem}
      />
    </div>
  );
}
