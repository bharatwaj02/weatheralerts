import { useState, useEffect } from 'react';
import { Box, Button, Stack, Typography, FormHelperText, Alert, Chip } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { formatDateForApi } from '../utils/dateUtils';
import { subDays } from 'date-fns';

interface DateRangePickerProps {
  onApplyFilter: (startDate: string | undefined, endDate: string | undefined) => void;
}

const DateRangePicker = ({ onApplyFilter }: DateRangePickerProps) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [dateRangeError, setDateRangeError] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Listen for reset event from parent component
  useEffect(() => {
    const handleResetEvent = () => {
      setStartDate(null);
      setEndDate(null);
      setActivePreset(null);
      setDateRangeError(null);
    };

    window.addEventListener('reset-date-range', handleResetEvent);
    
    return () => {
      window.removeEventListener('reset-date-range', handleResetEvent);
    };
  }, []);

  const handleApplyFilter = () => {
    // Validate that startDate is before endDate
    if (startDate && endDate && startDate > endDate) {
      setDateRangeError('Start date must be before end date');
      return;
    }
    
    setDateRangeError(null);
    const formattedStartDate = formatDateForApi(startDate);
    const formattedEndDate = formatDateForApi(endDate);
    onApplyFilter(formattedStartDate, formattedEndDate);
  };

  const handlePresetClick = (preset: string) => {
    setActivePreset(preset);
    
    const today = new Date();
    
    switch (preset) {
      case 'past24h':
        setStartDate(subDays(today, 1));
        setEndDate(today);
        break;
      case 'past3d':
        setStartDate(subDays(today, 3));
        setEndDate(today);
        break;
      case 'past7d':
        setStartDate(subDays(today, 7));
        setEndDate(today);
        break;
      case 'reset':
        setStartDate(null);
        setEndDate(null);
        setActivePreset(null);
        onApplyFilter(undefined, undefined);
        return; // Return early to avoid auto-applying
    }
    
    // If we selected a preset other than reset, automatically apply the filter
    if (preset !== 'reset') {
      setTimeout(() => {
        const formattedStartDate = formatDateForApi(subDays(today, 
          preset === 'past24h' ? 1 : preset === 'past3d' ? 3 : 7));
        const formattedEndDate = formatDateForApi(today);
        onApplyFilter(formattedStartDate, formattedEndDate);
      }, 0);
    }
  };

  const handleStartDateChange = (newValue: Date | null) => {
    setStartDate(newValue);
    setActivePreset(null); // Clear preset when manually selecting dates
    if (dateRangeError && (!newValue || !endDate || newValue <= endDate)) {
      setDateRangeError(null);
    }
  };

  const handleEndDateChange = (newValue: Date | null) => {
    setEndDate(newValue);
    setActivePreset(null); // Clear preset when manually selecting dates
    if (dateRangeError && (!startDate || !newValue || startDate <= newValue)) {
      setDateRangeError(null);
    }
  };

  const handleResetFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setActivePreset(null);
    setDateRangeError(null);
    onApplyFilter(undefined, undefined);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filter by Date Range
        </Typography>
        
        {dateRangeError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {dateRangeError}
          </Alert>
        )}
        
        <Stack 
          direction="row" 
          spacing={1} 
          sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}
        >
          <Chip 
            label="Last 24 Hours" 
            onClick={() => handlePresetClick('past24h')}
            color={activePreset === 'past24h' ? 'primary' : 'default'}
            variant={activePreset === 'past24h' ? 'filled' : 'outlined'}
            sx={{ borderRadius: '16px' }}
          />
          <Chip 
            label="Last 3 Days" 
            onClick={() => handlePresetClick('past3d')}
            color={activePreset === 'past3d' ? 'primary' : 'default'}
            variant={activePreset === 'past3d' ? 'filled' : 'outlined'}
            sx={{ borderRadius: '16px' }}
          />
          <Chip 
            label="Last 7 Days" 
            onClick={() => handlePresetClick('past7d')}
            color={activePreset === 'past7d' ? 'primary' : 'default'}
            variant={activePreset === 'past7d' ? 'filled' : 'outlined'}
            sx={{ borderRadius: '16px' }}
          />
          <Chip 
            label="Clear Dates" 
            onClick={() => handlePresetClick('reset')}
            variant="outlined"
            sx={{ borderRadius: '16px' }}
          />
        </Stack>
        
        <FormHelperText sx={{ mt: -1, mb: 2 }}>Select a preset or use custom dates below</FormHelperText>
        
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          alignItems="center"
          sx={{ 
            '& .MuiButton-root': { 
              minWidth: '120px',
              height: '40px'
            }
          }}
        >
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={handleStartDateChange}
            slotProps={{
              textField: {
                fullWidth: true,
                size: "small",
                margin: "normal",
                error: !!dateRangeError && !!startDate && !!endDate && startDate > endDate
              }
            }}
          />
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={handleEndDateChange}
            slotProps={{
              textField: {
                fullWidth: true,
                size: "small",
                margin: "normal",
                error: !!dateRangeError && !!startDate && !!endDate && startDate > endDate
              }
            }}
          />
          <Box sx={{ display: 'flex', gap: 1, mt: { xs: 2, sm: 0 }, width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'space-between', sm: 'flex-end' } }}>
            <Button 
              variant="contained" 
              onClick={handleApplyFilter}
            >
              Apply Filter
            </Button>
            <Button 
              variant="outlined" 
              onClick={handleResetFilters}
            >
              Reset
            </Button>
          </Box>
        </Stack>
      </Box>
    </LocalizationProvider>
  );
};

export default DateRangePicker;
