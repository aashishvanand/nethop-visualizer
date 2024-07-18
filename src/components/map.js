'use client';

import { useEffect, useState } from 'react';
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

export default function Map({ coords, isDarkMode }) {
  const [map, setMap] = useState(null);

  const parsedCoords = coords.map(coord => {
    const [lat, lon] = coord.loc;
    return [parseFloat(lat), parseFloat(lon)];
  });

  useEffect(() => {
    if (map) {
      map.invalidateSize();
    }
  }, [isDarkMode, map]);

  const lightTileLayer = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const darkTileLayer = "https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png";

  return (
    <MapContainer
      className="map-container"
      center={[0, 0]}
      zoom={2}
      style={{ height: '500px', width: '100%', backgroundColor: isDarkMode ? '#333' : '#ccc' }}
      whenCreated={setMap}
    >
      <TileLayer
        url={isDarkMode ? darkTileLayer : lightTileLayer}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Polyline positions={parsedCoords} color={isDarkMode ? "#fff" : "red"} />
      <SetBounds coords={coords} />
    </MapContainer>
  );
}