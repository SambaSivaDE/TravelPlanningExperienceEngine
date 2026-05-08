import React, { useState, useEffect } from 'react';
import { Share2, Bookmark, Sun, Clock, Map as MapIcon, Calculator, Ticket, X } from 'lucide-react';

interface MapInfoCardProps {
  name: string;
  onEstimateBudget: () => void;
  onBookTickets: () => void;
  onClose: () => void;
}

export default function MapInfoCard({ name, onEstimateBudget, onBookTickets, onClose }: MapInfoCardProps) {
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [weather] = useState('Mostly Sunny · 18°C');
  const [localTime, setLocalTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  useEffect(() => {
    if (!name) return;

    const fetchHeroImage = async () => {
      if (!window.google) return;
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      service.findPlaceFromQuery(
        { query: `${name} landmark city`, fields: ['photos'] },
        (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results?.[0]?.photos) {
            setHeroImage(results[0].photos[0].getUrl({ maxWidth: 400, maxHeight: 200 }));
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
    <div className="absolute top-6 left-6 z-50 w-[360px] bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in slide-in-from-left duration-500">
      <button 
        onClick={onClose}
        className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm text-slate-400 hover:text-slate-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Hero Image Section */}
      <div className="relative h-40 bg-slate-100">
        {heroImage ? (
          <img src={heroImage} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <MapIcon className="w-10 h-10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>

      {/* Destination Info Section */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">{name}</h1>
            <p className="text-slate-500 text-xs font-medium">Global Destination</p>
          </div>
          <div className="text-right text-slate-500 text-[10px]">
            <div className="flex items-center gap-1 justify-end">
              <Sun className="w-3 h-3 text-amber-500" />
              <span>{weather}</span>
            </div>
            <div className="flex items-center gap-1 justify-end mt-1 font-mono">
              <Clock className="w-3 h-3" />
              <span>{localTime}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center py-4 border-t border-b border-slate-100">
          <ActionButton 
            icon={<Ticket className="w-4 h-4" />} 
            label="Plan to Travel" 
            color="text-emerald-600" 
            onClick={onBookTickets}
          />
          <ActionButton 
            icon={<Calculator className="w-4 h-4" />} 
            label="Budget" 
            color="text-blue-600" 
            onClick={onEstimateBudget}
          />
          <ActionButton icon={<Bookmark className="w-4 h-4" />} label="Save" color="text-slate-600" />
          <ActionButton icon={<Share2 className="w-4 h-4" />} label="Share" color="text-slate-600" />
        </div>

        {/* Quick Facts Section */}
        <div className="mt-4">
          <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-2">Quick Facts</h3>
          <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">
            {name} is an iconic destination offering a perfect blend of history, culture, and modern experiences. 
            Explore the local landmarks and enjoy a curated 3-day itinerary designed for an unforgettable journey.
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
      className="flex flex-col items-center gap-1.5 group transition-all"
    >
      <div className={`p-2.5 rounded-full bg-slate-50 border border-slate-200 group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors ${color}`}>
        {icon}
      </div>
      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter group-hover:text-blue-600 transition-colors">
        {label}
      </span>
    </button>
  );
}
