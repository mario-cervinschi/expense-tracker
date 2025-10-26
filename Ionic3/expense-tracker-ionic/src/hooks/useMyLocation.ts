import { useEffect, useState } from 'react';
import { Geolocation, Position } from '@capacitor/geolocation';

interface MyLocation {
  position?: Position | null;
  error?: Error;
}

export const useMyLocation = () => {
  const [state, setState] = useState<MyLocation>({});

  useEffect(() => {
    let cancelled = false;
    let callbackId: string | null = null;

    function updateMyPosition(source: string, position?: Position | null, error: any = undefined) {
      console.log(source, position, error);
      if (!cancelled && (position || error)) {
        setState({ position, error });
      }
    }

    async function watchMyLocation() {
      try {
        const position = await Geolocation.getCurrentPosition();
        updateMyPosition('current', position);
      } catch (error) {
        updateMyPosition('current', null, error);
      }

      if (cancelled) {
        return;
      }
      
      try {
        callbackId = await Geolocation.watchPosition({}, (position, error) => {
          updateMyPosition('watch', position, error);
        });
      } catch (error) {
         updateMyPosition('watch', null, error as Error);
         console.error("Failed to start watchPosition", error);
      }
    }

    watchMyLocation();

    return () => {
      cancelled = true;
      if (callbackId) {
        Geolocation.clearWatch({ id: callbackId });
      }
    };
  }, []);

  return state;
};