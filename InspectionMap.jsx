import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

// Replace with your actual API key or use process.env.REACT_APP_GOOGLE_MAPS_API_KEY
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const InspectionMap = ({ onLocationSelect }) => {
  const mapRef = useRef(null);
  const searchInputRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: GOOGLE_MAPS_API_KEY,
        version: 'weekly',
        libraries: ['places', 'marker', 'geocoding'] // Added 'marker' for AdvancedMarkerElement
      });

      try {
        const google = await loader.load();
        const { Map } = await google.maps.importLibrary("maps");
        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
        const { Autocomplete } = await google.maps.importLibrary("places");
        const { Geocoder } = await google.maps.importLibrary("geocoding");

        // Initialize Map
        const mapInstance = new Map(mapRef.current, {
          center: { lat: 31.0461, lng: 34.8516 }, // Israel center
          zoom: 8,
          mapId: 'DEMO_MAP_ID', // Required for AdvancedMarkerElement
        });

        setMap(mapInstance);
        setLoading(false);

        const geocoder = new Geocoder();

        // Initialize Autocomplete
        const autocomplete = new Autocomplete(searchInputRef.current, {
          fields: ['geometry', 'formatted_address'],
          componentRestrictions: { country: 'il' },
        });
        autocomplete.bindTo('bounds', mapInstance);

        // Handle Place Selection from Search
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (!place.geometry || !place.geometry.location) return;

          if (place.geometry.viewport) {
            mapInstance.fitBounds(place.geometry.viewport);
          } else {
            mapInstance.setCenter(place.geometry.location);
            mapInstance.setZoom(17);
          }

          placeMarker(place.geometry.location, mapInstance, AdvancedMarkerElement);
          setAddress(place.formatted_address);
          if (onLocationSelect) {
            onLocationSelect({
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
              address: place.formatted_address
            });
          }
        });

        // Handle Map Clicks
        mapInstance.addListener('click', (e) => {
          placeMarker(e.latLng, mapInstance, AdvancedMarkerElement);
          geocodeLatLng(e.latLng, geocoder);
        });

        // Helper: Place Marker
        let currentMarker = null;
        const placeMarker = (position, mapObj, MarkerClass) => {
          if (currentMarker) {
            currentMarker.map = null; // Remove old marker
          }

          currentMarker = new MarkerClass({
            map: mapObj,
            position: position,
            title: "נקודת ביקורת"
          });
          setMarker(currentMarker);
        };

        // Helper: Geocode
        const geocodeLatLng = (latLng, geocoderObj) => {
          geocoderObj.geocode({ location: latLng }, (results, status) => {
            if (status === 'OK' && results[0]) {
              const newAddress = results[0].formatted_address;
              setAddress(newAddress);
              if (onLocationSelect) {
                onLocationSelect({
                  lat: latLng.lat(),
                  lng: latLng.lng(),
                  address: newAddress
                });
              }
            } else {
              console.error('Geocoder failed due to: ' + status);
            }
          });
        };

      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    initMap();
  }, []); // Empty dependency array = run once on mount

  return (
    <div className="w-full">
      <div className="mb-4">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="חפש כתובת או עסק..."
          className="w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div 
        ref={mapRef} 
        className="w-full h-96 rounded-lg shadow-md border border-gray-200"
      />
      
      {address && <p className="mt-2 text-sm text-gray-600">כתובת נבחרת: <span className="font-semibold">{address}</span></p>}
    </div>
  );
};

export default InspectionMap;