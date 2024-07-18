'use client';

import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
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
  const parsedCoords = coords.map((coord, index) => {
    const [lat, lon] = coord.loc;
    return { lat: parseFloat(lat), lon: parseFloat(lon), hop: index + 1 };
  });

  return (
    <MapContainer
      className="map-container"
      center={[0, 0]}
      zoom={2}
      style={{ height: '500px', width: '100%', backgroundColor: '#ccc' }}
    >
      <TileLayer
        url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
      />
      <Polyline positions={parsedCoords.map(coord => [coord.lat, coord.lon])} color="red" />
      {parsedCoords.map((coord, index) => (
        <Marker key={index} position={[coord.lat, coord.lon]}>
          <Popup>
            <div>
              <span className="caption">Hop {coord.hop}</span>
              <hr />
              <span>{coord.lat}, {coord.lon}</span>
            </div>
          </Popup>
        </Marker>
      ))}
      <SetBounds coords={coords} />
    </MapContainer>
  );
}
