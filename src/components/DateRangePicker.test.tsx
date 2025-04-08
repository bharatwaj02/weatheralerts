import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import DateRangePicker from './DateRangePicker';

const mockOnApplyFilter = jest.fn();

const renderWithProvider = (component: React.ReactNode) => {
  return render(
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      {component}
    </LocalizationProvider>
  );
};

describe('DateRangePicker', () => {
  beforeEach(() => {
    mockOnApplyFilter.mockClear();
  });

  it('renders all preset options', () => {
    renderWithProvider(<DateRangePicker onApplyFilter={mockOnApplyFilter} />);
    
    expect(screen.getByText('Last 24 Hours')).toBeInTheDocument();
    expect(screen.getByText('Last 3 Days')).toBeInTheDocument();
    expect(screen.getByText('Last 7 Days')).toBeInTheDocument();
  });

  it('applies preset filters correctly', async () => {
    renderWithProvider(<DateRangePicker onApplyFilter={mockOnApplyFilter} />);
    
    fireEvent.click(screen.getByText('Last 24 Hours'));
    
    await waitFor(() => {
      expect(mockOnApplyFilter).toHaveBeenCalled();
    });
  });

  it('handles manual date selection', async () => {
    renderWithProvider(<DateRangePicker onApplyFilter={mockOnApplyFilter} />);
    
    const startDate = screen.getByLabelText('Start Date');
    const endDate = screen.getByLabelText('End Date');
    
    fireEvent.change(startDate, { target: { value: '2024-01-01' } });
    fireEvent.change(endDate, { target: { value: '2024-01-02' } });
    
    fireEvent.click(screen.getByText('Apply Filter'));
    
    expect(mockOnApplyFilter).toHaveBeenCalled();
  });

  it('resets dates when Clear Dates is clicked', () => {
    renderWithProvider(<DateRangePicker onApplyFilter={mockOnApplyFilter} />);
    
    fireEvent.click(screen.getByText('Clear Dates'));
    
    expect(mockOnApplyFilter).toHaveBeenCalledWith(undefined, undefined);
  });
});
