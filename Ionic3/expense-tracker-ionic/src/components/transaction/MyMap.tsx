import { GoogleMap } from '@capacitor/google-maps';
import { useEffect, useRef } from 'react';
import { mapsApiKey } from '../../mapsApiKey';

interface MyMapProps {
  lat: number;
  lng: number;
  markers?: Array<{ lat: number; lng: number; title: string }>;
  editable?: boolean;
  onMapClick?: (e: { latitude: number; longitude: number }) => void;
  onMarkerClick?: (e: { markerId: string; latitude: number; longitude: number }) => void;
}

const MyMap: React.FC<MyMapProps> = ({ 
  lat, 
  lng, 
  markers = [], 
  editable = false,
  onMapClick, 
  onMarkerClick 
}) => {
  const mapRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    return myMapEffect();
  }, [lat, lng, markers.length, editable]);

  return (
    <div className="component-wrapper">
      <capacitor-google-map 
        ref={mapRef} 
        style={{
          display: 'block',
          width: '100%',
          height: 400
        }}
      ></capacitor-google-map>
    </div>
  );

  function myMapEffect() {
    let canceled = false;
    let googleMap: GoogleMap | null = null;
    createMap();
    
    return () => {
      canceled = true;
      googleMap?.removeAllMapListeners();
      googleMap?.destroy();
    };

    async function createMap() {
      if (!mapRef.current || canceled) {
        return;
      }

      try {
        googleMap = await GoogleMap.create({
          id: 'my-cool-map',
          element: mapRef.current,
          apiKey: mapsApiKey,
          config: {
            center: { lat, lng },
            zoom: 14
          }
        });

        console.log('gm created');

        for (const marker of markers) {
          await googleMap.addMarker({ 
            coordinate: { lat: marker.lat, lng: marker.lng }, 
            title: marker.title 
          });
        }

        if (editable && onMapClick) {
          await googleMap.setOnMapClickListener(({ latitude, longitude }) => {
            onMapClick({ latitude, longitude });
          });
        }

        if (onMarkerClick) {
          await googleMap.setOnMarkerClickListener(({ markerId, latitude, longitude }) => {
            onMarkerClick({ markerId, latitude, longitude });
          });
        }
      } catch (error) {
        console.error('Error creating map:', error);
      }
    }
  }
};

export default MyMap;