'use client';

import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function SetBounds({ coords }) {
  const map = useMap();
  if (coords.length > 0) {
    const bounds = coords.map(coord => [coord.loc[0], coord.loc[1]]);
    map.fitBounds(bounds);
  }
  return null;
}

export default function Map({ coords }) {
  const parsedCoords = coords.map(coord => {
    const [lat, lon] = coord.loc;
    return [parseFloat(lat), parseFloat(lon)];
  });

  return (
    <MapContainer
      center={[0, 0]}
      zoom={2}
      style={{ height: '500px', width: '100%', marginTop: '1rem', backgroundColor: '#ccc' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Polyline positions={parsedCoords} color="red" />
      <SetBounds coords={coords} />
    </MapContainer>
  );
}
