import React, { useState } from 'react';
import { X, PlaneTakeoff, PlaneLanding, Users, Calendar, Phone } from 'lucide-react';

interface TravelDetailsFormProps {
  destination: string;
  onClose: () => void;
  onSubmit: (details: {
    from: string;
    to: string;
    phone: string;
    people: number;
    days: number;
  }) => void;
}

export default function TravelDetailsForm({ destination, onClose, onSubmit }: TravelDetailsFormProps) {
  const [from, setFrom] = useState('');
  const [phone, setPhone] = useState('');
  const [people, setPeople] = useState(1);
  const [days, setDays] = useState(3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ from, to: destination, phone, people, days });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">
        <div className="relative p-8">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Plan Your Journey</h2>
            <p className="text-slate-500 mt-2 font-medium">Let's get the final details for your trip.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <PlaneTakeoff className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  required
                  type="text"
                  placeholder="From (City/Airport)"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="relative group opacity-60">
                <PlaneLanding className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  disabled
                  type="text"
                  value={destination}
                  className="w-full bg-slate-100 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 cursor-not-allowed"
                />
              </div>

              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  required
                  type="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative group">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    required
                    type="number"
                    min="1"
                    placeholder="Travelers"
                    value={people}
                    onChange={(e) => setPeople(parseInt(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    required
                    type="number"
                    min="1"
                    placeholder="Days"
                    value={days}
                    onChange={(e) => setDays(parseInt(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-600/30 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Confirm Journey Plan
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
