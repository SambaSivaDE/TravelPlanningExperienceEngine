import { useState } from 'react';
import ChatPanel from './components/ChatPanel';
import MapPanel from './components/MapPanel';

export interface DestinationInfo {
  lat: number;
  lng: number;
  destination_name: string;
  rationale: string;
  famous_places: string[];
  budget: {
    currency: string;
    total: number;
    breakdown: { category: string; amount: number }[];
    notes: string;
  };
}

function App() {
  const [destination, setDestination] = useState<DestinationInfo | null>(null);

  const handleDestinationUpdate = (dest: DestinationInfo) => {
    setDestination(dest);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 text-slate-900 font-sans">
      <div className="w-[450px] min-w-[400px] h-full relative z-10 shadow-xl bg-white border-r border-slate-200 flex flex-col">
        <ChatPanel onDestinationUpdate={handleDestinationUpdate} />
      </div>
      <div className="flex-1 relative overflow-hidden">
        <MapPanel 
          destination={destination} 
          onEstimateBudget={() => (window as any).triggerBudget?.()}
          onBookTickets={() => (window as any).triggerBooking?.()}
        />
      </div>
    </div>
  );
}

export default App;
