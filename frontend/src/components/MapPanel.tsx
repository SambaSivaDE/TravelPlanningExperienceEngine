import React, { useEffect, useRef, useState } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import { flyToDestination } from '../services/mapFlyTo';
import MapInfoCard from './MapInfoCard';
import type { DestinationInfo } from '../App';

interface MapPanelProps {
  destination: DestinationInfo | null;
  onEstimateBudget: () => void;
  onBookTickets: () => void;
}

const MapComponent: React.FC<MapPanelProps & { onShowCard: boolean, setShowCard: (s: boolean) => void }> = React.memo(({ 
  destination, 
  onEstimateBudget, 
  onBookTickets,
  onShowCard,
  setShowCard
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    if (mapRef.current && !map) {
      const initializedMap = new window.google.maps.Map(mapRef.current, {
        center: { lat: 20, lng: 0 },
        zoom: 3,
        mapId: 'DEMO_MAP_ID',
        disableDefaultUI: true,
        backgroundColor: '#0f172a',
        colorScheme: 'DARK' as any,
      });
      setMap(initializedMap);
    }
  }, [map]);

  useEffect(() => {
    if (map && destination) {
      flyToDestination(map, destination.lat, destination.lng);
      setShowCard(true);
      
      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: destination.lat, lng: destination.lng },
        title: destination.destination_name,
      });

      marker.addListener('click', () => {
        setShowCard(true);
      });

      return () => {
        marker.map = null;
      };
    }
  }, [map, destination]);

  return (
    <div className="w-full h-full relative" role="application" aria-label="Interactive 3D Travel Map">
      <div ref={mapRef} className="w-full h-full" />
      {onShowCard && destination && (
        <MapInfoCard 
          name={destination.destination_name}
          onEstimateBudget={onEstimateBudget}
          onBookTickets={onBookTickets}
          onClose={() => setShowCard(false)}
        />
      )}
    </div>
  );
});

export default function MapPanel({ destination, onEstimateBudget, onBookTickets }: MapPanelProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const [showCard, setShowCard] = useState(false);

  if (!apiKey) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-400">
        Google Maps API Key not found.
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <Wrapper apiKey={apiKey} version="beta" libraries={['marker', 'places']}>
        <MapComponent 
          destination={destination} 
          onEstimateBudget={onEstimateBudget}
          onBookTickets={onBookTickets}
          onShowCard={showCard}
          setShowCard={setShowCard}
        />
      </Wrapper>
    </div>
  );
}
