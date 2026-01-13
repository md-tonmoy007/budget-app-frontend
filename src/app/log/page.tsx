"use client";
import React, { useState } from 'react';
import ExpenseForm from '../../components/ExpenseForm';
import Navbar from '../../components/Navbar';
import ExpenseList from '../../components/ExpenseList';

export default function LogPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
                <ExpenseForm onSuccess={() => setRefreshKey(k => k + 1)} />
            </div>
            <div>
                <ExpenseList refreshKey={refreshKey} />
            </div>
        </div>
      </div>
    </div>
  );
}
