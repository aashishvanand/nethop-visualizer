'use client';

import { MapContainer, TileLayer, Polyline } from 'react-leaflet';

export default function Map({ coords }) {
  const parsedCoords = coords.map(coord => {
    const [lat, lon] = coord.loc;
    return [parseFloat(lat), parseFloat(lon)];
  });

  return (
    <MapContainer center={[0, 0]} zoom={2} style={{ height: '500px', width: '100%', marginTop: '1rem' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Polyline positions={parsedCoords} color="red" />
    </MapContainer>
  );
}
