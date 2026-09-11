import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix default Leaflet marker icon URLs
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export const MapView = ({ center = [28.6139, 77.2090], markers = [], height = "400px" }) => {
  return (
    <div style={{ height }} className="w-full rounded-2xl overflow-hidden shadow-inner border border-gray-200 dark:border-gray-800">
      <MapContainer center={center} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {markers.map((m, idx) => (
          <Marker key={idx} position={m.position || center}>
            <Popup>
              <div className="p-1">
                <h5 className="font-bold text-gray-900">{m.title || 'Rescue Location'}</h5>
                <p className="text-xs text-gray-600 mt-1">{m.address}</p>
                {m.quantityKg && <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-xs">{m.quantityKg} Kg</span>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
