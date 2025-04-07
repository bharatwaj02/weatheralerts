import { useState, useEffect, useMemo } from 'react';
import { Container, Typography, Box, Button, Paper, CircularProgress, Alert as MuiAlert, Chip, Stack } from '@mui/material';
import { useWeatherAlerts } from '../hooks/useWeatherAlerts';
import AlertTable from '../components/AlertTable';
import DateRangePicker from '../components/DateRangePicker';
import StateSelector from '../components/StateSelector';

const Home = () => {
  const [queryParams, setQueryParams] = useState({
    active: true,
    area: '',
    start: undefined as string | undefined,
    end: undefined as string | undefined
  });

  // Fetch alerts with React Query
  const { data: alerts = [], isLoading, isError, error } = useWeatherAlerts(queryParams);

  // Calculate alert summary counts
  const alertSummary = useMemo(() => {
    const summary = {
      emergency: 0,
      severe: 0,
      moderate: 0,
      minor: 0,
      unknown: 0,
      total: alerts.length
    };

    alerts.forEach(alert => {
      const severity = alert.properties.severity.toLowerCase();
      if (severity === 'extreme') {
        summary.emergency++;
      } else if (severity === 'severe') {
        summary.severe++;
      } else if (severity === 'moderate') {
        summary.moderate++;
      } else if (severity === 'minor') {
        summary.minor++;
      } else {
        summary.unknown++;
      }
    });

    return summary;
  }, [alerts]);

  // Group alerts by event type
  const eventTypes = useMemo(() => {
    const types: Record<string, number> = {};
    
    alerts.forEach(alert => {
      const event = alert.properties.event;
      if (types[event]) {
        types[event]++;
      } else {
        types[event] = 1;
      }
    });
    
    return Object.entries(types)
      .sort((a, b) => b[1] - a[1]) // Sort by count (descending)
      .slice(0, 10); // Get top 10 event types
  }, [alerts]);

  // Load all alerts on initial render
  useEffect(() => {
    // This will trigger a fetch with the default parameters
    // No need to do anything else since queryParams is already set up correctly
  }, []);

  const handleDateRangeFilter = (startDate: string | undefined, endDate: string | undefined) => {
    // Apply filters immediately if we're setting date params directly
    setQueryParams({
      ...queryParams,
      start: startDate,
      end: endDate
    });
  };

  const handleAreaFilter = (stateCode: string) => {
    // Apply filters immediately
    setQueryParams({
      ...queryParams,
      area: stateCode.trim() ? stateCode.toUpperCase().trim() : ''
    });
  };

  const handleResetAllFilters = () => {
    setQueryParams({
      active: true,
      area: '',
      start: undefined,
      end: undefined
    });
    
    // Reset the input fields in the components
    const dateRangeResetEvent = new CustomEvent('reset-date-range');
    const stateSelectorResetEvent = new CustomEvent('reset-state-selector');
    
    window.dispatchEvent(dateRangeResetEvent);
    window.dispatchEvent(stateSelectorResetEvent);
  };

  // Create placeholder content for loading state
  const renderSummaryPlaceholder = () => (
    <>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Chip label="Loading..." color="default" />
      </Box>
      <Typography variant="subtitle1" gutterBottom>
        Top Event Types:
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Chip 
          label="Loading..."
          variant="outlined"
          size="small"
          sx={{ mb: 1 }}
        />
      </Stack>
    </>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        National Weather Service Alerts
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 4 }}>
        {/* Filter Box */}
        <Paper elevation={2} sx={{ p: 3, flex: 1 }}>
          <DateRangePicker onApplyFilter={handleDateRangeFilter} />
          <StateSelector onApplyFilter={handleAreaFilter} />
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="outlined" 
              color="secondary"
              onClick={handleResetAllFilters}
            >
              Reset All Filters
            </Button>
          </Box>
        </Paper>
        
        {/* Summary Box */}
        <Paper elevation={2} sx={{ p: 3, flex: 1 }}>
          <Typography variant="h6" gutterBottom>
            Alert Summary
          </Typography>
          
          {isLoading ? renderSummaryPlaceholder() : (
            <>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                {alertSummary.emergency > 0 && (
                  <Chip 
                    label={`${alertSummary.emergency} Extreme`} 
                    color="error" 
                    variant="filled" 
                    sx={{ fontWeight: 'bold' }}
                  />
                )}
                {alertSummary.severe > 0 && (
                  <Chip 
                    label={`${alertSummary.severe} Severe`} 
                    color="error" 
                    variant="outlined" 
                  />
                )}
                {alertSummary.moderate > 0 && (
                  <Chip 
                    label={`${alertSummary.moderate} Moderate`} 
                    color="warning" 
                  />
                )}
                {alertSummary.minor > 0 && (
                  <Chip 
                    label={`${alertSummary.minor} Minor`} 
                    color="info" 
                  />
                )}
                <Chip 
                  label={`${alertSummary.total} Total`} 
                  color="default" 
                />
              </Box>
              
              {eventTypes.length > 0 && (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Top Event Types:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {eventTypes.map(([type, count]) => (
                      <Chip 
                        key={type}
                        label={`${type} (${count})`}
                        variant="outlined"
                        size="small"
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </Stack>
                </>
              )}
            </>
          )}
        </Paper>
      </Box>

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
          <AlertTable alerts={alerts} isLoading={isLoading} />
        </>
      )}
    </Container>
  );
};

export default Home;
