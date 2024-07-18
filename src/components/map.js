'use client';

import { MapContainer, TileLayer, Polyline } from 'react-leaflet';

export default function Map({ coords }) {
  return (
    <MapContainer center={[0, 0]} zoom={2} style={{ height: '500px', width: '100%', marginTop: '1rem' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Polyline positions={coords.map(coord => [parseFloat(coord[0]), parseFloat(coord[1])])} color="red" />
    </MapContainer>
  );
}
