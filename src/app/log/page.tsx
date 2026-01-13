import ExpenseForm from '../../components/ExpenseForm';
import Navbar from '../../components/Navbar';

export default function LogPage() {
  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ExpenseForm />
      </div>
    </div>
  );
}
