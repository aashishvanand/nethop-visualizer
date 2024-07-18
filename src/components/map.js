'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function SetBounds({ coords }) {
  const map = useMap();
  if (coords.length > 0) {
    const bounds = coords.map(coord => [coord.loc[0], coord.loc[1]]);
    map.fitBounds(bounds);
  }
  return null;
}

function groupMarkers(coords) {
  const groupedMarkers = {};
  coords.forEach((coord, index) => {
    const key = `${coord.loc[0]},${coord.loc[1]}`;
    if (!groupedMarkers[key]) {
      groupedMarkers[key] = { ...coord, hops: [{ hop: index + 1, ip: coord.ip }] };
    } else {
      groupedMarkers[key].hops.push({ hop: index + 1, ip: coord.ip });
    }
  });
  return Object.values(groupedMarkers);
}

export default function Map({ coords, isDarkMode }) {
  const [map, setMap] = useState(null);

  const parsedCoords = coords.map(coord => {
    const [lat, lon] = coord.loc;
    return [parseFloat(lat), parseFloat(lon)];
  });

  const groupedMarkers = groupMarkers(coords);

  useEffect(() => {
    if (map) {
      map.invalidateSize();
    }
  }, [isDarkMode, map]);

  const lightTileLayer = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const darkTileLayer = "https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png";

  const markerIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-' + (isDarkMode ? 'violet.png' : 'red.png'),
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

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
      {groupedMarkers.map((marker, index) => (
        <Marker key={index} position={marker.loc} icon={markerIcon}>
          <Popup>
            <div>
              <strong>{marker.city}, {marker.region}, {marker.country}</strong>
              <br />
              {marker.hops.map(hop => (
                <div key={hop.hop}>
                  Hop {hop.hop}: {hop.ip}
                </div>
              ))}
            </div>
          </Popup>
        </Marker>
      ))}
      <SetBounds coords={coords} />
    </MapContainer>
  );
}