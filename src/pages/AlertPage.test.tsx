import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AlertPage from './AlertPage';
import { useWeatherAlert } from '../hooks/useWeatherAlerts';
import { Alert } from '../services/weatherApi';

// Mock the React Router hooks
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: 'test-id-1' }),
  useNavigate: () => mockNavigate
}));

// Mock the custom hook
jest.mock('../hooks/useWeatherAlerts', () => ({
  useWeatherAlert: jest.fn(),
}));

// Mock the AlertDetails component
jest.mock('../components/AlertDetails', () => ({
  __esModule: true,
  default: ({ alert, isLoading, isError, error }: { 
    alert: Alert | undefined, 
    isLoading: boolean, 
    isError: boolean, 
    error: Error | null 
  }) => (
    <div data-testid="alert-details">
      {isLoading && <div>Loading alert details...</div>}
      {isError && <div>Error: {error?.message || 'Unknown error'}</div>}
      {alert && <div>Alert details for: {alert.properties.event}</div>}
    </div>
  ),
}));

describe('AlertPage', () => {
  const mockAlert: Alert = {
    id: 'test-id-1',
    type: 'Feature',
    properties: {
      '@id': 'test-id-url-1',
      id: 'test-id-1',
      event: 'Flood Warning',
      headline: 'Flood Warning for County A',
      areaDesc: 'County A',
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

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    // Mock the hook to return loading state
    (useWeatherAlert as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null
    });

    render(
      <BrowserRouter>
        <AlertPage />
      </BrowserRouter>
    );
    
    // Check that the back button is rendered
    expect(screen.getByText('Back to Alerts')).toBeInTheDocument();
    
    // Check that the loading state is shown
    expect(screen.getByText('Loading alert details...')).toBeInTheDocument();
  });

  it('renders alert details correctly when data is loaded', () => {
    // Mock the hook to return data
    (useWeatherAlert as jest.Mock).mockReturnValue({
      data: mockAlert,
      isLoading: false,
      isError: false,
      error: null
    });

    render(
      <BrowserRouter>
        <AlertPage />
      </BrowserRouter>
    );
    
    // Check that the alert details are rendered
    expect(screen.getByText(`Alert details for: ${mockAlert.properties.event}`)).toBeInTheDocument();
  });

  it('renders error state correctly', () => {
    // Mock the hook to return error state
    const errorMessage = 'Failed to fetch alert';
    (useWeatherAlert as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error(errorMessage)
    });

    render(
      <BrowserRouter>
        <AlertPage />
      </BrowserRouter>
    );
    
    // Check that the error message is shown
    expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
  });

  it('navigates back to home page when back button is clicked', () => {
    // Mock the hook to return data
    (useWeatherAlert as jest.Mock).mockReturnValue({
      data: mockAlert,
      isLoading: false,
      isError: false,
      error: null
    });

    render(
      <BrowserRouter>
        <AlertPage />
      </BrowserRouter>
    );
    
    // Click the back button
    fireEvent.click(screen.getByText('Back to Alerts'));
    
    // Check that the navigate function was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
