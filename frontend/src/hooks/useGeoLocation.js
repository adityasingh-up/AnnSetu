import { useState, useEffect } from 'react';

export const useGeoLocation = () => {
  const [location, setLocation] = useState({
    lat: 28.6139,
    lng: 77.2090, // Default New Delhi
    loaded: false,
    error: null
  });

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setLocation((prev) => ({ ...prev, loaded: true, error: 'Geolocation not supported' }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          loaded: true,
          error: null
        });
      },
      (error) => {
        setLocation((prev) => ({ ...prev, loaded: true, error: error.message }));
      }
    );
  }, []);

  return location;
};
