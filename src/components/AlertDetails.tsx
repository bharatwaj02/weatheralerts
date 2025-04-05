import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Divider, 
  Grid as MuiGrid, 
  Link,
  Paper,
  CircularProgress
} from '@mui/material';
import { Alert } from '../services/weatherApi';
import { formatDate, getSeverityColor } from '../utils/dateUtils';

interface AlertDetailsProps {
  alert: Alert | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

const AlertDetails = ({ alert, isLoading, isError, error }: AlertDetailsProps) => {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Typography color="error" variant="h6">
        Error loading alert: {error?.message || 'Unknown error'}
      </Typography>
    );
  }

  if (!alert) {
    return <Typography variant="h6">Alert not found</Typography>;
  }

  const { properties } = alert;

  return (
    <Card elevation={3}>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            {properties.event}
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {properties.headline}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
            <Chip 
              label={properties.severity} 
              color={getSeverityColor(properties.severity)}
            />
            <Chip label={properties.urgency} />
            <Chip label={properties.certainty} />
            <Chip label={properties.status} variant="outlined" />
            <Chip label={properties.messageType} variant="outlined" />
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <MuiGrid container spacing={3}>
          <MuiGrid item xs={12} md={6}>
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
                  <strong>Onset:</strong> {formatDate(properties.onset)}
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
          </MuiGrid>

          <MuiGrid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">Source Information</Typography>
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2">
                  <strong>Source:</strong> {properties.senderName}
                </Typography>
                <Typography variant="body2">
                  <strong>Status:</strong> {properties.status}
                </Typography>
                <Typography variant="body2">
                  <strong>Message Type:</strong> {properties.messageType}
                </Typography>
                <Typography variant="body2">
                  <strong>Category:</strong> {properties.category}
                </Typography>
                <Typography variant="body2">
                  <strong>Response Type:</strong> {properties.response}
                </Typography>
              </Box>
            </Paper>
          </MuiGrid>

          <MuiGrid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">Affected Area</Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                {properties.areaDesc}
              </Typography>
            </Paper>
          </MuiGrid>

          <MuiGrid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">Description</Typography>
              <Typography variant="body1" sx={{ mt: 1, whiteSpace: 'pre-line' }}>
                {properties.description}
              </Typography>
            </Paper>
          </MuiGrid>

          {properties.instruction && (
            <MuiGrid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">Instructions</Typography>
                <Typography variant="body1" sx={{ mt: 1, whiteSpace: 'pre-line' }}>
                  {properties.instruction}
                </Typography>
              </Paper>
            </MuiGrid>
          )}

          <MuiGrid item xs={12}>
            <Box sx={{ mt: 2 }}>
              <Link href={properties['@id']} target="_blank" rel="noopener">
                View on National Weather Service
              </Link>
            </Box>
          </MuiGrid>
        </MuiGrid>
      </CardContent>
    </Card>
  );
};

export default AlertDetails;
