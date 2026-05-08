import React, { useEffect, useRef, useState } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import { flyToDestination } from '../services/mapFlyTo';
import { DestinationInfo } from '../App';

interface MapPanelProps {
  destination: DestinationInfo | null;
}

const MapComponent: React.FC<MapPanelProps> = ({ destination }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    if (mapRef.current && !map) {
      const initializedMap = new window.google.maps.Map(mapRef.current, {
        center: { lat: 20, lng: 0 },
        zoom: 3,
        mapId: 'DEMO_MAP_ID', // Reqd for vector map and 3D features
        disableDefaultUI: true,
        backgroundColor: '#0f172a',
      });
      setMap(initializedMap);
    }
  }, [map]);

  useEffect(() => {
    if (map && destination) {
      flyToDestination(map, destination.lat, destination.lng);
      
      // Add a marker for the destination
      new window.google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: destination.lat, lng: destination.lng },
        title: destination.destination_name,
      });
    }
  }, [map, destination]);

  return <div ref={mapRef} className="w-full h-full" />;
};

export default function MapPanel({ destination }: MapPanelProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400">
        Google Maps API Key not found.
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <Wrapper apiKey={apiKey} version="beta" libraries={['marker']}>
        <MapComponent destination={destination} />
      </Wrapper>
      {destination && (
        <div className="absolute top-6 left-6 z-10 glass-panel p-4 rounded-2xl max-w-sm animate-fade-in">
          <h2 className="text-xl font-bold mb-2">{destination.destination_name}</h2>
          <p className="text-sm text-slate-300">{destination.rationale}</p>
        </div>
      )}
    </div>
  );
}
