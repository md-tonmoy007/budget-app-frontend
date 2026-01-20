"use client";
import { useState } from 'react';
import api from '../lib/api';
import { PlusCircle } from 'lucide-react';

export default function WishlistForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    estimated_amount: '',
    priority: 'Medium',
    link: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/wishlist/', {
        ...formData,
        estimated_amount: parseFloat(formData.estimated_amount)
      });
      setFormData({
        name: '',
        estimated_amount: '',
        priority: 'Medium',
        link: '',
        notes: ''
      });
      onSuccess();
    } catch (error) {
      alert("Failed to add item");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <PlusCircle size={20} className="text-indigo-400" />
        Add Planned Purchase
      </h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <input 
          placeholder="What do you want to buy?"
          required
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition-all lg:col-span-1"
          value={formData.name}
          onChange={e => setFormData({...formData, name: e.target.value})}
        />
        <input 
          type="number" step="0.01" placeholder="Est. Price"
          required
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          value={formData.estimated_amount}
          onChange={e => setFormData({...formData, estimated_amount: e.target.value})}
        />
        <select 
          className="bg-[#1a1a1a] text-white border border-white/10 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          value={formData.priority}
          onChange={e => setFormData({...formData, priority: e.target.value})}
        >
          <option value="High">High Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="Low">Low Priority</option>
        </select>
        <input 
          placeholder="Link (optional)"
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          value={formData.link}
          onChange={e => setFormData({...formData, link: e.target.value})}
        />
        <button 
          type="submit" 
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-lg px-4 py-2 transition-all"
        >
          {loading ? 'Adding...' : 'Add to List'}
        </button>
      </form>
    </div>
  );
}
