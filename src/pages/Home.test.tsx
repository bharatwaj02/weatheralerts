import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from './Home';
import { useWeatherAlerts } from '../hooks/useWeatherAlerts';
import { Alert } from '../services/weatherApi';

// Mock the custom hook
jest.mock('../hooks/useWeatherAlerts', () => ({
  useWeatherAlerts: jest.fn(),
}));

// Mock the child components to simplify testing
jest.mock('../components/AlertTable', () => ({
  __esModule: true,
  default: ({ alerts, isLoading }: { alerts: Alert[], isLoading: boolean }) => (
    <div data-testid="alert-table">
      {isLoading ? 'AlertTable Loading...' : `Alert Table with ${alerts.length} alerts`}
    </div>
  ),
}));

jest.mock('../components/DateRangePicker', () => ({
  __esModule: true,
  default: ({ onApplyFilter }: { onApplyFilter: (start: string | undefined, end: string | undefined) => void }) => (
    <div data-testid="date-range-picker">
      <button onClick={() => onApplyFilter('2024-01-01', '2024-01-31')}>Apply Date Filter</button>
    </div>
  ),
}));

jest.mock('../components/StateSelector', () => ({
  __esModule: true,
  default: ({ onApplyFilter }: { onApplyFilter: (state: string) => void }) => (
    <div data-testid="state-selector">
      <button onClick={() => onApplyFilter('CA')}>Apply State Filter</button>
    </div>
  ),
}));

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Home', () => {
  const mockAlerts: Alert[] = [
    {
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
    },
    {
      id: 'test-id-2',
      type: 'Feature',
      properties: {
        '@id': 'test-id-url-2',
        id: 'test-id-2',
        event: 'Tornado Warning',
        headline: 'Tornado Warning for County B',
        areaDesc: 'County B',
        sent: '2024-01-01T00:00:00Z',
        effective: '2024-01-01T00:00:00Z',
        onset: '2024-01-01T00:00:00Z',
        expires: '2024-01-02T00:00:00Z',
        ends: '2024-01-02T00:00:00Z',
        status: 'Actual',
        messageType: 'Alert',
        category: 'Met',
        severity: 'Extreme',
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
      }
    }
  ];

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    // Mock the hook to return loading state
    (useWeatherAlerts as jest.Mock).mockReturnValue({
      data: [],
      isLoading: true,
      isError: false,
      error: null
    });

    renderWithRouter(<Home />);
    
    // Check that the page title is rendered
    expect(screen.getByText('National Weather Service Alerts')).toBeInTheDocument();
    
    // Check that the loading state is shown - look for CircularProgress
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

  });

  it('renders alerts correctly when data is loaded', () => {
    // Mock the hook to return data
    (useWeatherAlerts as jest.Mock).mockReturnValue({
      data: mockAlerts,
      isLoading: false,
      isError: false,
      error: null
    });

    renderWithRouter(<Home />);
    
    // Check that the alert table is rendered with the correct number of alerts
    expect(screen.getByText(`Alert Table with ${mockAlerts.length} alerts`)).toBeInTheDocument();
    
    // Check that the summary chips are displayed
    expect(screen.getByText('1 Extreme')).toBeInTheDocument();
    expect(screen.getByText('1 Severe')).toBeInTheDocument();
    expect(screen.getByText('2 Total')).toBeInTheDocument();
    
    // Check that the event types are displayed
    expect(screen.getByText('Flood Warning (1)')).toBeInTheDocument();
    expect(screen.getByText('Tornado Warning (1)')).toBeInTheDocument();
  });

  it('applies date range filter correctly', async () => {
    // Mock the hook initially
    (useWeatherAlerts as jest.Mock).mockReturnValue({
      data: mockAlerts,
      isLoading: false,
      isError: false,
      error: null
    });

    renderWithRouter(<Home />);
    
    // Click the date filter button in our mocked component
    fireEvent.click(screen.getByText('Apply Date Filter'));
    
    // Verify that the hook was called with the updated parameters
    await waitFor(() => {
      expect(useWeatherAlerts).toHaveBeenCalledWith(expect.objectContaining({
        start: '2024-01-01',
        end: '2024-01-31'
      }));
    });
  });

  it('applies state filter correctly', async () => {
    // Mock the hook initially
    (useWeatherAlerts as jest.Mock).mockReturnValue({
      data: mockAlerts,
      isLoading: false,
      isError: false,
      error: null
    });

    renderWithRouter(<Home />);
    
    // Click the state filter button in our mocked component
    fireEvent.click(screen.getByText('Apply State Filter'));
    
    // Verify that the hook was called with the updated parameters
    await waitFor(() => {
      expect(useWeatherAlerts).toHaveBeenCalledWith(expect.objectContaining({
        area: 'CA'
      }));
    });
  });

  it('resets all filters correctly', async () => {
    // Mock the hook initially
    (useWeatherAlerts as jest.Mock).mockReturnValue({
      data: mockAlerts,
      isLoading: false,
      isError: false,
      error: null
    });

    renderWithRouter(<Home />);
    
    // First apply some filters
    fireEvent.click(screen.getByText('Apply Date Filter'));
    fireEvent.click(screen.getByText('Apply State Filter'));
    
    // Then reset all filters
    fireEvent.click(screen.getByText('Reset All Filters'));
    
    // Verify that the hook was called with the reset parameters
    await waitFor(() => {
      expect(useWeatherAlerts).toHaveBeenCalledWith({
        active: true,
        area: '',
        start: undefined,
        end: undefined
      });
    });
  });
});
