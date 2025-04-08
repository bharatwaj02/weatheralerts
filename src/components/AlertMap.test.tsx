import { render, screen } from '@testing-library/react';
import AlertMap from './AlertMap';
import { Alert } from '../services/weatherApi';

// Create a simple mock for Leaflet
jest.mock('leaflet', () => {
  return {
    map: jest.fn(() => ({
      setView: jest.fn().mockReturnThis(),
      eachLayer: jest.fn(),
      removeLayer: jest.fn(),
      remove: jest.fn(),
      fitBounds: jest.fn(),
    })),
    tileLayer: jest.fn(() => ({
      addTo: jest.fn(),
    })),
    polygon: jest.fn(() => ({
      addTo: jest.fn(),
      getBounds: jest.fn().mockReturnValue({}),
      bindPopup: jest.fn(),
    })),
    Icon: {
      Default: {
        mergeOptions: jest.fn(),
      },
    },
  };
});

// Mock React's useRef and useEffect to prevent actual DOM manipulation
jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  return {
    ...originalReact,
    useRef: jest.fn().mockReturnValue({ 
      current: document.createElement('div') 
    }),
    // Replace useEffect with a no-op function that doesn't execute the callback
    useEffect: jest.fn(),
  };
});

describe('AlertMap', () => {
  it('renders no data message when alert is undefined', () => {
    render(<AlertMap alert={undefined} />);
    expect(screen.getByText(/no geographic data/i)).toBeInTheDocument();
  });

  it('renders map container when alert has geometry', () => {
    const mockAlert: Alert = {
      id: 'test-id',
      type: 'Feature',
      properties: {
        '@id': 'test-id-url',
        id: 'test-id',
        event: 'Test Alert',
        headline: 'Test Alert Headline',
        areaDesc: 'Test Area',
        sent: '2024-01-01T00:00:00Z',
        effective: '2024-01-01T00:00:00Z',
        onset: '2024-01-01T00:00:00Z',
        expires: '2024-01-02T00:00:00Z',
        ends: '2024-01-02T00:00:00Z',
        status: 'Actual',
        messageType: 'Alert',
        category: 'Met',
        severity: 'Severe',
        certainty: 'Observed',
        urgency: 'Immediate',
        sender: 'NWS',
        senderName: 'NWS Test',
        description: 'Test description',
        instruction: 'Test instructions',
        response: 'Shelter',
        parameters: {},
        affectedZones: [],
        geocode: {
          UGC: [],
          SAME: []
        }
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[0, 0, 1, 1, 0, 1, 0, 0]]
      }
    };

    render(<AlertMap alert={mockAlert} />);
    
    // Since we've mocked useEffect to not execute, we'll just test that the component renders
    // the heading and the map container
    expect(screen.getByText('Affected Area Map')).toBeInTheDocument();
    
    // The map container should be rendered within the Paper component
    // Use a more specific selector to find the map container div
    const paper = screen.getByText('Affected Area Map').closest('div');
    expect(paper).toBeInTheDocument();
    
    // Verify that the Paper contains a Box component which would be the map container
    const mapContainer = paper?.querySelector('.MuiBox-root');
    expect(mapContainer).toBeInTheDocument();
  });
});
