import React, { useState, useEffect } from 'react';
import { Share2, Bookmark, Sun, Clock, Map as MapIcon, Calculator, Ticket } from 'lucide-react';

interface DestinationHeroProps {
  name: string;
  onEstimateBudget?: () => void;
  onBookTickets?: () => void;
}

export default function DestinationHero({ name, onEstimateBudget, onBookTickets }: DestinationHeroProps) {
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [weather] = useState('Mostly Sunny · 18°C');
  const [localTime, setLocalTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  useEffect(() => {
    if (!name) return;

    const fetchHeroImage = async () => {
      if (!window.google) return;
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      service.findPlaceFromQuery(
        { query: name, fields: ['photos'] },
        (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results?.[0]?.photos) {
            setHeroImage(results[0].photos[0].getUrl({ maxWidth: 800, maxHeight: 400 }));
          }
        }
      );
    };

    fetchHeroImage();
    const timer = setInterval(() => {
      setLocalTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 60000);
    return () => clearInterval(timer);
  }, [name]);

  return (
    <div className="bg-white border-b border-slate-200 animate-in fade-in slide-in-from-top duration-700 overflow-hidden shadow-sm">
      {/* Hero Image Section */}
      <div className="relative h-48 sm:h-56 bg-slate-100">
        {heroImage ? (
          <img src={heroImage} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <MapIcon className="w-12 h-12" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>

      {/* Destination Info Section */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{name}</h1>
            <p className="text-slate-500 font-medium">Global Destination</p>
          </div>
          <div className="text-right text-slate-500 text-sm">
            <div className="flex items-center gap-1 justify-end">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>{weather}</span>
            </div>
            <div className="flex items-center gap-1 justify-end mt-1 font-mono">
              <Clock className="w-4 h-4" />
              <span>{localTime}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons (Google Maps Style) */}
        <div className="flex justify-between items-center px-2 py-4 border-t border-b border-slate-100">
          <ActionButton 
            icon={<Ticket className="w-5 h-5" />} 
            label="Book" 
            color="text-emerald-600" 
            onClick={onBookTickets}
          />
          <ActionButton 
            icon={<Calculator className="w-5 h-5" />} 
            label="Budget" 
            color="text-blue-600" 
            onClick={onEstimateBudget}
          />
          <ActionButton icon={<Bookmark className="w-5 h-5" />} label="Save" color="text-slate-600" />
          <ActionButton icon={<Share2 className="w-5 h-5" />} label="Share" color="text-slate-600" />
        </div>

        {/* Quick Facts Section */}
        <div className="mt-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-3">Quick Facts</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            {name} is one of the most visited locations in the world, known for its rich cultural heritage, 
            stunning architecture, and vibrant local atmosphere. Plan your 3-day trip carefully to capture 
            the essence of this remarkable destination.
          </p>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ icon, label, color, onClick }: { icon: React.ReactNode; label: string; color: string; onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center gap-2 group transition-all"
    >
      <div className={`p-3 rounded-full bg-slate-50 border border-slate-200 group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors ${color}`}>
        {icon}
      </div>
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter group-hover:text-blue-600 transition-colors">
        {label}
      </span>
    </button>
  );
}
