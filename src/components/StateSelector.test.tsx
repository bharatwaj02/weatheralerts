import { render, screen, fireEvent } from '@testing-library/react';
import StateSelector from './StateSelector';

const mockOnApplyFilter = jest.fn();

describe('StateSelector', () => {
  beforeEach(() => {
    mockOnApplyFilter.mockClear();
  });

  it('renders state selector and buttons', () => {
    render(<StateSelector onApplyFilter={mockOnApplyFilter} />);
    
    expect(screen.getByText('Filter by Area')).toBeInTheDocument();
    expect(screen.getByLabelText('State')).toBeInTheDocument();
    expect(screen.getByText('Apply Filter')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });

  it('calls onApplyFilter with empty string when reset is clicked', () => {
    render(<StateSelector onApplyFilter={mockOnApplyFilter} />);
    
    fireEvent.click(screen.getByText('Reset'));
    
    expect(mockOnApplyFilter).toHaveBeenCalledWith('');
  });

  it('shows helper text', () => {
    render(<StateSelector onApplyFilter={mockOnApplyFilter} />);
    
    expect(screen.getByText('Search by state name or code (e.g., California or CA)')).toBeInTheDocument();
  });
});