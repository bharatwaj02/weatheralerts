import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Button, Box } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useWeatherAlert } from '../hooks/useWeatherAlerts';
import AlertDetails from '../components/AlertDetails';

const AlertPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { 
    data: alert, 
    isLoading, 
    isError, 
    error 
  } = useWeatherAlert(id);

  const handleBack = () => {
    navigate('/');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
          variant="outlined"
        >
          Back to Alerts
        </Button>
      </Box>

      <Typography variant="h4" component="h1" gutterBottom>
        Alert Details
      </Typography>

      <AlertDetails 
        alert={alert} 
        isLoading={isLoading} 
        isError={isError} 
        error={error as Error | null} 
      />
    </Container>
  );
};

export default AlertPage;
