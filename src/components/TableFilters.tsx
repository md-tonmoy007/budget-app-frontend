"use client";
import { useState } from 'react';
import { Search, Calendar, Filter, X, ArrowUpDown, ChevronDown } from 'lucide-react';

interface Account {
  id: number;
  name: string;
}

interface TableFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  selectedAccount: string;
  onAccountChange: (value: string) => void;
  accounts: Account[];
  selectedType: string;
  onTypeChange: (value: string) => void;
  types: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (field: string, order: 'asc' | 'desc') => void;
  onClearFilters: () => void;
  typeLabel?: string; // e.g., "Expense Type" or "Income Type"
}

export default function TableFilters({
  searchTerm,
  onSearchChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  selectedAccount,
  onAccountChange,
  accounts,
  selectedType,
  onTypeChange,
  types,
  sortBy,
  sortOrder,
  onSortChange,
  onClearFilters,
  typeLabel = "Type"
}: TableFiltersProps) {
  
  const hasActiveFilters = searchTerm || dateFrom || dateTo || selectedAccount || selectedType || sortBy !== 'date' || sortOrder !== 'desc';

  // Collapsed by default on mobile so filters don't push the data below the fold
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 sm:p-6 mb-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 sm:pointer-events-none"
          aria-expanded={expanded}
        >
          <Filter size={20} className="text-gray-400" />
          <h3 className="text-lg font-semibold">Filters & Search</h3>
          <ChevronDown size={18} className={`sm:hidden text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <X size={16} />
            Clear All
          </button>
        )}
      </div>

      <div className={`${expanded ? 'grid' : 'hidden'} sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4`}>
        {/* Search Bar */}
        <div className="lg:col-span-3">
          <label className="block text-sm font-medium mb-2 opacity-80">Search</label>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by description, type, or account..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium mb-2 opacity-80">
            <Calendar size={14} className="inline mr-1" />
            From Date
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 opacity-80">
            <Calendar size={14} className="inline mr-1" />
            To Date
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Account Filter */}
        <div>
          <label className="block text-sm font-medium mb-2 opacity-80">Account</label>
          <select
            value={selectedAccount}
            onChange={(e) => onAccountChange(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white"
          >
            <option value="">All Accounts</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id} className="text-black">
                {acc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium mb-2 opacity-80">{typeLabel}</label>
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white"
          >
            <option value="">All Types</option>
            {types.map(type => (
              <option key={type} value={type} className="text-black">
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Controls */}
        <div>
          <label className="block text-sm font-medium mb-2 opacity-80">
            <ArrowUpDown size={14} className="inline mr-1" />
            Sort By
          </label>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value, sortOrder)}
              className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white"
            >
              <option value="date" className="text-black">Date</option>
              <option value="amount" className="text-black">Amount</option>
              <option value="account" className="text-black">Account</option>
              <option value="type" className="text-black">Type</option>
            </select>
            <button
              onClick={() => onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
              title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
