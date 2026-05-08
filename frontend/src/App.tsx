import { useState } from 'react';
import ChatPanel from './components/ChatPanel';
import MapPanel from './components/MapPanel';

export interface DestinationInfo {
  lat: number;
  lng: number;
  destination_name: string;
  rationale: string;
}

function App() {
  const [destination, setDestination] = useState<DestinationInfo | null>(null);

  const handleDestinationUpdate = (dest: DestinationInfo) => {
    setDestination(dest);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-900 text-slate-100 font-sans">
      <div className="w-full md:w-1/3 h-full relative z-10 shadow-2xl bg-slate-900/90 backdrop-blur-xl border-r border-slate-700/50 flex flex-col">
        <ChatPanel onDestinationUpdate={handleDestinationUpdate} />
      </div>
      <div className="flex-1 h-full relative">
        <MapPanel destination={destination} />
      </div>
    </div>
  );
}

export default App;
