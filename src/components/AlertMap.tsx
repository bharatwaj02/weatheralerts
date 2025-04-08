import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Paper, Typography } from '@mui/material';
import { Alert } from '../services/weatherApi';

interface AlertMapProps {
  alert: Alert | undefined;
}

const AlertMap = ({ alert }: AlertMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    // Known issue: Leaflet's default icon paths don't work in production builds
    // This fix ensures marker icons are loaded from a CDN
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });

    // Exit early if no alert data or map container is available
    if (!alert?.geometry || !mapRef.current) return;

    // Create map instance only once and persist it in ref
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([0, 0], 2);
      
      // Add base map layer using OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;

    // Remove all layers except the base map to prevent overlapping polygons
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) return; // Keep the base tile layer
      map.removeLayer(layer);
    });

    // Handle Polygon geometry type for weather alert areas
    if (alert.geometry.type === 'Polygon') {
      // Convert GeoJSON (lon, lat) to Leaflet (lat, lon) coordinate system
      const coordinates = alert.geometry.coordinates[0].map((coord: any) => [coord[1], coord[0]]) as L.LatLngExpression[];
      
      // Create and style the alert area polygon
      const polygon = L.polygon(coordinates, {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.3,
        weight: 2
      }).addTo(map);
      
      // Auto-zoom map to show the entire alert area
      map.fitBounds(polygon.getBounds());
      
      // Add interactive popup with alert details
      polygon.bindPopup(`<b>${alert.properties.event}</b><br>${alert.properties.areaDesc}`);
    }

    // Cleanup map instance when component unmounts
    return () => {
      if (mapInstanceRef.current && !mapRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [alert]);

  if (!alert?.geometry) {
    return (
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold">Map</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          No geographic data available for this alert.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle1" fontWeight="bold">Affected Area Map</Typography>
      <Box 
        ref={mapRef} 
        sx={{ 
          height: 400, 
          width: '100%', 
          mt: 2,
          border: '1px solid #ddd',
          borderRadius: 1
        }} 
      />
    </Paper>
  );
};

export default AlertMap;
