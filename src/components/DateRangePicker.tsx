import { useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { formatDateForApi } from '../utils/dateUtils';

interface DateRangePickerProps {
  onApplyFilter: (startDate: string | undefined, endDate: string | undefined) => void;
}

const DateRangePicker = ({ onApplyFilter }: DateRangePickerProps) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleApplyFilter = () => {
    const formattedStartDate = formatDateForApi(startDate);
    const formattedEndDate = formatDateForApi(endDate);
    onApplyFilter(formattedStartDate, formattedEndDate);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filter by Date Range
        </Typography>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          alignItems="center"
        >
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            slotProps={{
              textField: {
                fullWidth: true,
                size: "small",
                margin: "normal"
              }
            }}
          />
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
            slotProps={{
              textField: {
                fullWidth: true,
                size: "small",
                margin: "normal"
              }
            }}
          />
          <Button 
            variant="contained" 
            onClick={handleApplyFilter}
            sx={{ mt: { xs: 2, sm: 0 }, height: { sm: 40 } }}
          >
            Apply Filter
          </Button>
        </Stack>
      </Box>
    </LocalizationProvider>
  );
};

export default DateRangePicker;
