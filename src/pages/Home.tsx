import { useState, useEffect } from 'react';
import { Container, Typography, Box, TextField, Button, Paper, CircularProgress, Alert as MuiAlert } from '@mui/material';
import { useWeatherAlerts } from '../hooks/useWeatherAlerts';
import AlertTable from '../components/AlertTable';
import DateRangePicker from '../components/DateRangePicker';

const Home = () => {
  const [area, setArea] = useState<string>('');
  const [dateParams, setDateParams] = useState<{
    start?: string;
    end?: string;
  }>({});
  
  const [queryParams, setQueryParams] = useState({
    active: true,
    area: '',
    start: undefined as string | undefined,
    end: undefined as string | undefined
  });

  // Fetch alerts with React Query
  const { data: alerts = [], isLoading, isError, error } = useWeatherAlerts(queryParams);

  // Load all alerts on initial render
  useEffect(() => {
    // This will trigger a fetch with the default parameters
    // No need to do anything else since queryParams is already set up correctly
  }, []);

  const handleDateRangeFilter = (startDate: string | undefined, endDate: string | undefined) => {
    setDateParams({ start: startDate, end: endDate });
  };

  const handleAreaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setArea(event.target.value);
  };

  const applyFilters = () => {
    setQueryParams({
      ...queryParams,
      area: area.trim() ? area.toUpperCase().trim() : '', // Only set area if it's not empty
      start: dateParams.start,
      end: dateParams.end
    });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        National Weather Service Alerts
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <DateRangePicker onApplyFilter={handleDateRangeFilter} />

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Filter by Area
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              label="State or Zone Code (e.g., CA, TX)"
              variant="outlined"
              value={area}
              onChange={handleAreaChange}
              fullWidth
              size="small"
              helperText="Enter a state code (e.g., CA) or leave empty for all alerts"
            />
            <Button 
              variant="contained" 
              onClick={applyFilters}
              sx={{ height: { sm: 40 } }}
            >
              Apply Filters
            </Button>
          </Box>
        </Box>
      </Paper>

      {isError && (
        <MuiAlert severity="error" sx={{ mb: 2 }}>
          Error loading alerts: {(error as Error)?.message || 'Unknown error'}
        </MuiAlert>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {alerts.length} Alerts Found
            </Typography>
          </Box>
          <AlertTable alerts={alerts} isLoading={isLoading} />
        </>
      )}
    </Container>
  );
};

export default Home;
