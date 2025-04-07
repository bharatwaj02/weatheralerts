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
    // Fix for Leaflet marker icons in production build
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });

    if (!alert?.geometry || !mapRef.current) return;

    // Initialize map if it doesn't exist
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([0, 0], 2);
      
      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;

    // Clear any existing layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) return; // Keep the base tile layer
      map.removeLayer(layer);
    });

    // Convert GeoJSON coordinates to Leaflet format
    if (alert.geometry.type === 'Polygon') {
      const coordinates = alert.geometry.coordinates[0].map((coord: any) => [coord[1], coord[0]]) as L.LatLngExpression[];
      
      // Create polygon and add to map
      const polygon = L.polygon(coordinates, {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.3,
        weight: 2
      }).addTo(map);
      
      // Fit map to polygon bounds
      map.fitBounds(polygon.getBounds());
      
      // Add a popup with alert information
      polygon.bindPopup(`<b>${alert.properties.event}</b><br>${alert.properties.areaDesc}`);
    }

    return () => {
      // Cleanup function
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
