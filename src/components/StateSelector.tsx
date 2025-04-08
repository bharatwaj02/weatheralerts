import { useState, useEffect } from 'react';
import { 
  Autocomplete, 
  TextField, 
  Box, 
  Typography, 
  Button, 
  Stack 
} from '@mui/material';

// List of US states with their abbreviations
const US_STATES = [
  { name: 'Alabama', code: 'AL' },
  { name: 'Alaska', code: 'AK' },
  { name: 'Arizona', code: 'AZ' },
  { name: 'Arkansas', code: 'AR' },
  { name: 'California', code: 'CA' },
  { name: 'Colorado', code: 'CO' },
  { name: 'Connecticut', code: 'CT' },
  { name: 'Delaware', code: 'DE' },
  { name: 'Florida', code: 'FL' },
  { name: 'Georgia', code: 'GA' },
  { name: 'Hawaii', code: 'HI' },
  { name: 'Idaho', code: 'ID' },
  { name: 'Illinois', code: 'IL' },
  { name: 'Indiana', code: 'IN' },
  { name: 'Iowa', code: 'IA' },
  { name: 'Kansas', code: 'KS' },
  { name: 'Kentucky', code: 'KY' },
  { name: 'Louisiana', code: 'LA' },
  { name: 'Maine', code: 'ME' },
  { name: 'Maryland', code: 'MD' },
  { name: 'Massachusetts', code: 'MA' },
  { name: 'Michigan', code: 'MI' },
  { name: 'Minnesota', code: 'MN' },
  { name: 'Mississippi', code: 'MS' },
  { name: 'Missouri', code: 'MO' },
  { name: 'Montana', code: 'MT' },
  { name: 'Nebraska', code: 'NE' },
  { name: 'Nevada', code: 'NV' },
  { name: 'New Hampshire', code: 'NH' },
  { name: 'New Jersey', code: 'NJ' },
  { name: 'New Mexico', code: 'NM' },
  { name: 'New York', code: 'NY' },
  { name: 'North Carolina', code: 'NC' },
  { name: 'North Dakota', code: 'ND' },
  { name: 'Ohio', code: 'OH' },
  { name: 'Oklahoma', code: 'OK' },
  { name: 'Oregon', code: 'OR' },
  { name: 'Pennsylvania', code: 'PA' },
  { name: 'Rhode Island', code: 'RI' },
  { name: 'South Carolina', code: 'SC' },
  { name: 'South Dakota', code: 'SD' },
  { name: 'Tennessee', code: 'TN' },
  { name: 'Texas', code: 'TX' },
  { name: 'Utah', code: 'UT' },
  { name: 'Vermont', code: 'VT' },
  { name: 'Virginia', code: 'VA' },
  { name: 'Washington', code: 'WA' },
  { name: 'West Virginia', code: 'WV' },
  { name: 'Wisconsin', code: 'WI' },
  { name: 'Wyoming', code: 'WY' },
  { name: 'District of Columbia', code: 'DC' },
  { name: 'American Samoa', code: 'AS' },
  { name: 'Guam', code: 'GU' },
  { name: 'Northern Mariana Islands', code: 'MP' },
  { name: 'Puerto Rico', code: 'PR' },
  { name: 'United States Minor Outlying Islands', code: 'UM' },
  { name: 'U.S. Virgin Islands', code: 'VI' },
];

interface StateSelectorProps {
  onApplyFilter: (stateCode: string) => void;
}

const StateSelector = ({ onApplyFilter }: StateSelectorProps) => {
  const [selectedState, setSelectedState] = useState<{ name: string; code: string } | null>(null);
  const [inputValue, setInputValue] = useState('');

  // Listen for reset event from parent component
  useEffect(() => {
    const handleResetEvent = () => {
      setSelectedState(null);
      setInputValue('');
    };

    window.addEventListener('reset-state-selector', handleResetEvent);
    
    return () => {
      window.removeEventListener('reset-state-selector', handleResetEvent);
    };
  }, []);

  const handleApplyFilter = () => {
    onApplyFilter(selectedState?.code || inputValue.toUpperCase().trim());
  };

  const handleResetFilter = () => {
    setSelectedState(null);
    setInputValue('');
    onApplyFilter('');
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Filter by Area
      </Typography>
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={2} 
         alignItems={{ xs: 'stretch', sm: 'flex-start' }}
        sx={{ 
          '& .MuiButton-root': { 
            minWidth: '120px',
             marginTop: '16px',
             height: '40px'
          }
        }}
      >
        <Autocomplete
          id="state-selector"
          options={US_STATES}
          getOptionLabel={(option) => {
            if (typeof option === 'string') {
              return option;
            }
            return `${option.name} (${option.code})`;
          }}
          value={selectedState}
          onChange={(_, newValue) => {
            if (newValue && typeof newValue === 'object') {
              setSelectedState(newValue);
            } else {
              setSelectedState(null);
            }
          }}
          inputValue={inputValue}
          onInputChange={(_, newInputValue) => {
            setInputValue(newInputValue);
          }}
          isOptionEqualToValue={(option, value) => option.code === value.code}
          renderInput={(params) => (
            <TextField
              {...params}
              label="State"
              variant="outlined"
              fullWidth
              size="small"
              margin="normal"
              helperText="Search by state name or code (e.g., California or CA)"
            />
          )}
          fullWidth
          freeSolo
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
            onClick={handleResetFilter}
          >
            Reset
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default StateSelector;
