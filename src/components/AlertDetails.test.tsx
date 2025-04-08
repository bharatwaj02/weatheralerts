import { render, screen } from '@testing-library/react';
import AlertDetails from './AlertDetails';
import { Alert } from '../services/weatherApi';

// Mock the AlertMap component to avoid Leaflet-related errors
jest.mock('./AlertMap', () => {
  return {
    __esModule: true,
    default: ({ alert }: { alert: Alert | undefined }) => (
      <div data-testid="mock-alert-map">
        {alert ? 'Map Component' : 'No Map Data'}
      </div>
    ),
  };
});

const mockAlert: Alert = {
  id: 'test-id',
  type: 'Feature',
  properties: {
    '@id': 'test-id-url',
    id: 'test-id',
    event: 'Severe Storm',
    headline: 'Test Storm Warning',
    severity: 'Severe',
    areaDesc: 'Test Area',
    description: 'Test Description',
    instruction: 'Test Instructions',
    sent: '2024-01-01T00:00:00Z',
    effective: '2024-01-01T00:00:00Z',
    onset: '2024-01-01T00:00:00Z',
    expires: '2024-01-02T00:00:00Z',
    ends: '2024-01-02T00:00:00Z',
    status: 'Actual',
    messageType: 'Alert',
    category: 'Met',
    certainty: 'Observed',
    urgency: 'Immediate',
    sender: 'NWS',
    senderName: 'NWS Test',
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

describe('AlertDetails', () => {
  it('renders loading state', () => {
    render(<AlertDetails alert={undefined} isLoading={true} isError={false} error={null} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders error state', () => {
    render(
      <AlertDetails 
        alert={undefined} 
        isLoading={false} 
        isError={true} 
        error={new Error('Test error')} 
      />
    );
    expect(screen.getByText(/error loading alert/i)).toBeInTheDocument();
  });

  it('renders alert details', () => {
    render(
      <AlertDetails 
        alert={mockAlert} 
        isLoading={false} 
        isError={false} 
        error={null} 
      />
    );
    
    expect(screen.getByText('Severe Storm')).toBeInTheDocument();
    expect(screen.getByText('Test Storm Warning')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Test Instructions')).toBeInTheDocument();
    expect(screen.getByTestId('mock-alert-map')).toBeInTheDocument();
  });

  it('renders time information correctly', () => {
    render(
      <AlertDetails 
        alert={mockAlert} 
        isLoading={false} 
        isError={false} 
        error={null} 
      />
    );
    
    expect(screen.getByText(/effective/i)).toBeInTheDocument();
    expect(screen.getByText(/expires/i)).toBeInTheDocument();
  });
});
