import { Wallet, Plane, Hotel, Utensils, Car, Compass, Info } from 'lucide-react';

interface BudgetItem {
  category: string;
  amount: number;
}

interface BudgetCardProps {
  destination: string;
  currency: string;
  breakdown: BudgetItem[];
  total: number;
  notes: string;
}

const getIcon = (category: string) => {
  const c = category.toLowerCase();
  if (c.includes('flight')) return <Plane className="w-4 h-4 text-blue-500" />;
  if (c.includes('hotel') || c.includes('accommodation')) return <Hotel className="w-4 h-4 text-emerald-500" />;
  if (c.includes('food') || c.includes('meal')) return <Utensils className="w-4 h-4 text-orange-500" />;
  if (c.includes('transport') || c.includes('car')) return <Car className="w-4 h-4 text-purple-500" />;
  if (c.includes('activity') || c.includes('tour')) return <Compass className="w-4 h-4 text-rose-500" />;
  return <Wallet className="w-4 h-4 text-slate-500" />;
};

export default function BudgetCard({ destination, currency, breakdown, total, notes }: BudgetCardProps) {
  return (
    <div className="mt-4 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm animate-in slide-in-from-bottom-4 duration-500">
      <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900">Budget for {destination}</h3>
          <p className="text-xs text-slate-500">3-Day Trip for 1 Person</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase">
            {currency}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {breakdown.map((item, i) => (
          <div key={i} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                {getIcon(item.category)}
              </div>
              <span className="text-sm font-medium text-slate-700">{item.category}</span>
            </div>
            <span className="text-sm font-bold text-slate-900">
              {currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : '$'}
              {item.amount.toLocaleString()}
            </span>
          </div>
        ))}

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-base font-bold text-slate-900">Total Estimated</span>
          <span className="text-xl font-black text-blue-600">
            {currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : '$'}
            {total.toLocaleString()}
          </span>
        </div>

        {notes && (
          <div className="mt-4 p-3 bg-blue-50 rounded-2xl flex gap-3 items-start">
            <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-[11px] text-blue-700 leading-relaxed italic">
              {notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
