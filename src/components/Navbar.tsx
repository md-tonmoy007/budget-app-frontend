import Link from 'next/link';
import { LayoutDashboard, PlusCircle } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              ExpenseTracker
            </Link>
          </div>
          <div className="flex space-x-4">
            <Link href="/" className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
            <Link href="/log" className="flex items-center px-3 py-2 rounded-md text-sm font-medium bg-indigo-600 hover:bg-indigo-700 transition-colors">
              <PlusCircle className="w-4 h-4 mr-2" />
              Log Expense
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
