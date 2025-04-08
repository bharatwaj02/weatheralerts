import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Divider, 
  Paper,
  CircularProgress,
  Stack
} from '@mui/material';
import { Alert } from '../services/weatherApi';
import { formatDate, getSeverityColor } from '../utils/dateUtils';
import AlertMap from './AlertMap';

interface AlertDetailsProps {
  alert: Alert | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

const AlertDetails = ({ alert, isLoading, isError, error }: AlertDetailsProps) => {
  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        p: 4, 
        minHeight: '70vh', 
        width: '100%' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        p: 4, 
        minHeight: '70vh', 
        width: '100%' 
      }}>
        <Typography color="error" variant="h6">
          Error loading alert: {error?.message || 'Unknown error'}
        </Typography>
      </Box>
    );
  }

  if (!alert) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        p: 4, 
        minHeight: '70vh', 
        width: '100%' 
      }}>
        <Typography variant="h6">Alert not found</Typography>
      </Box>
    );
  }

  const { properties } = alert;

  return (
    <Box sx={{ width: '100%', py: 2 }}>
      <Card elevation={3} sx={{ width: '100%' }}>
        <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" gutterBottom>
              {properties.event}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {properties.headline}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              {/* Only show severity chip */}
              <Chip 
                label={properties.severity} 
                color={getSeverityColor(properties.severity)}
                sx={{ fontWeight: 'bold' }}
              />
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Two-column layout for better space utilization */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            gap: 3,
            minHeight: '600px'  // Ensure minimum height
          }}>
            {/* Left column: Map */}
            <Box sx={{ 
              flex: 2,  // Changed from 1.5 to 2
              minHeight: { xs: '400px', md: '600px' }
            }}>
              <AlertMap alert={alert} />
            </Box>

            {/* Right column: Alert Details */}
            <Box sx={{ 
              flex: 1,
              width: '100%'  
            }}>
              <Paper 
                elevation={0} 
                variant="outlined" 
                sx={{ 
                  p: 3, 
                  mb: 3, 
                  borderRadius: 2,
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  height: '100%'
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                  Alert Details
                </Typography>
                
                <Stack spacing={3}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">Time Information</Typography>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2">
                        <strong>Sent:</strong> {formatDate(properties.sent)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Effective:</strong> {formatDate(properties.effective)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Expires:</strong> {formatDate(properties.expires)}
                      </Typography>
                      {properties.ends && (
                        <Typography variant="body2">
                          <strong>Ends:</strong> {formatDate(properties.ends)}
                        </Typography>
                      )}
                    </Box>
                  </Paper>

                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">Source Information</Typography>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2">
                        <strong>Source:</strong> {properties.senderName}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Category:</strong> {properties.category}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Response Type:</strong> {properties.response}
                      </Typography>
                    </Box>
                  </Paper>

                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">Affected Area</Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {properties.areaDesc}
                    </Typography>
                  </Paper>
                </Stack>
              </Paper>
            </Box>
          </Box>

          {/* Alert Content Panel - Full width */}
          <Paper 
            elevation={0} 
            variant="outlined" 
            sx={{ 
              p: 3, 
              mt: 3,
              borderRadius: 2,
              backgroundColor: 'rgba(0, 0, 0, 0.02)'
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Alert Content
            </Typography>
            
            <Stack spacing={3}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">Description</Typography>
                <Typography variant="body1" sx={{ mt: 1, whiteSpace: 'pre-line' }}>
                  {properties.description}
                </Typography>
              </Paper>

              {properties.instruction && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">Instructions</Typography>
                  <Typography variant="body1" sx={{ mt: 1, whiteSpace: 'pre-line' }}>
                    {properties.instruction}
                  </Typography>
                </Paper>
              )}
            </Stack>
          </Paper>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AlertDetails;
