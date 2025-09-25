'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import react-leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface ServiceLocation {
  id: number;
  name: string;
  category: string;
  price: number;
  eligible: boolean;
  rating: number;
  reviewCount: number;
  image: string;
  coordinates: [number, number]; // [latitude, longitude]
  address: string;
}

interface InteractiveMapProps {
  services: ServiceLocation[];
  onServiceSelect?: (service: ServiceLocation) => void;
}

export default function InteractiveMap({ services, onServiceSelect }: InteractiveMapProps) {
  const [, setSelectedService] = useState<ServiceLocation | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Import Leaflet and fix markers only on client side
    import('leaflet').then((L) => {
      // Fix for default markers in react-leaflet
      delete (L.default.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.default.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    });
  }, []);

  const handleMarkerClick = (service: ServiceLocation) => {
    setSelectedService(service);
    if (onServiceSelect) {
      onServiceSelect(service);
    }
  };

  // Don't render map until client-side
  if (!isClient) {
    return (
      <div className="h-[500px] w-full rounded-lg overflow-hidden shadow-sm border border-gray-200 bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

      return (
      <div className="h-[500px] w-full rounded-lg overflow-hidden shadow-sm border border-blue-200">
      <MapContainer
        center={[40.7128, -74.0060]} // NYC coordinates
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        {services.map((service) => (
          <Marker
            key={service.id}
            position={service.coordinates}
            eventHandlers={{
              click: () => handleMarkerClick(service),
            }}
          >
            <Popup>
              <div className="p-3 bg-white rounded-lg shadow-lg border border-blue-200 max-w-xs">
                <h3 className="font-semibold text-blue-900 text-sm mb-1">{service.name}</h3>
                <p className="text-xs text-blue-600 mb-2">{service.address}</p>
                <div className="flex items-center gap-1 mb-2">
                  <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                    {service.category}
                  </span>
                  <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                    HSA
                  </span>
                </div>
                <p className="font-semibold text-blue-800 text-sm">${service.price}</p>
                <button 
                  className="mt-2 w-full bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded hover:bg-blue-700 transition"
                  onClick={() => onServiceSelect?.(service)}
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
} 