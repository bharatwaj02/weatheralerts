import { useState, useMemo } from 'react';
import { Container, Typography, Box, Button, Paper, CircularProgress, Alert as MuiAlert, Chip, Stack } from '@mui/material';
import { useWeatherAlerts } from '../hooks/useWeatherAlerts';
import { Alert } from '../services/weatherApi';
import AlertTable from '../components/AlertTable';
import DateRangePicker from '../components/DateRangePicker';
import StateSelector from '../components/StateSelector';
import { isWithinInterval } from 'date-fns';

const Home = () => {
  const [selectedState, setSelectedState] = useState<string>('');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);

  const { data: alerts = [], isLoading, isError, error } = useWeatherAlerts();

  /** Filters alerts based on state, date range, and excludes test messages */
  const getFilteredAlerts = (alerts: Alert[]) => {
    return alerts.filter(alert => {
      const isTestMessage = alert.properties.event.toLowerCase().includes('test');
      if (isTestMessage) return false;

      // State filter
      if (selectedState) {
        const alertState = alert.properties.geocode?.UGC?.[0]?.substring(0, 2);
        if (!alertState || alertState !== selectedState) {
          return false;
        }
      }

      // Date range filter
      if (dateRange[0] && dateRange[1]) {
        const alertDate = new Date(alert.properties.effective);
        if (!isWithinInterval(alertDate, { 
          start: dateRange[0], 
          end: dateRange[1] 
        })) {
          return false;
        }
      }

      return true;
    });
  };

  /** 
   * Calculates alert statistics based on severity levels:
   * - Emergency/Extreme
   * - Severe
   * - Moderate
   * - Minor
   * - Unknown
   */
  const alertSummary = useMemo(() => {
    const filteredAlerts = getFilteredAlerts(alerts);
    const summary = {
      emergency: 0,
      severe: 0,
      moderate: 0,
      minor: 0,
      unknown: 0,
      total: filteredAlerts.length
    };

    filteredAlerts.forEach(alert => {
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
  }, [alerts, selectedState, dateRange]);

  /** Groups and sorts alerts by event type, returning top 10 most frequent events */
  const eventTypes = useMemo(() => {
    const filteredAlerts = getFilteredAlerts(alerts);
    const types: Record<string, number> = {};
    
    filteredAlerts.forEach(alert => {
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
  }, [alerts, selectedState, dateRange]);

  /** Handlers for filter updates */
  const handleDateRangeFilter = (startDate: string | undefined, endDate: string | undefined) => {
    setDateRange([
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null
    ]);
  };

  const handleAreaFilter = (stateCode: string) => {
    setSelectedState(stateCode.trim() ? stateCode.toUpperCase().trim() : '');
  };

  /** Resets all filters and triggers reset events for child components */
  const handleResetAllFilters = () => {
    setSelectedState('');
    setDateRange([null, null]);
    
    // Reset the input fields in the components
    const dateRangeResetEvent = new CustomEvent('reset-date-range');
    const stateSelectorResetEvent = new CustomEvent('reset-state-selector');
    
    window.dispatchEvent(dateRangeResetEvent);
    window.dispatchEvent(stateSelectorResetEvent);
  };

  /** Renders loading state for summary section */
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
          <AlertTable 
            alerts={alerts} 
            isLoading={isLoading} 
            selectedState={selectedState}
            dateRange={dateRange}
          />
        </>
      )}
    </Container>
  );
};

export default Home;
