import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DataGrid, 
  GridColDef, 
  GridFilterModel,
  GridSortModel,
  GridToolbar,
  GridRenderCellParams
} from '@mui/x-data-grid';
import { Box, Chip, Typography, Switch, FormControlLabel, Paper, useTheme, useMediaQuery } from '@mui/material';
import { Alert } from '../services/weatherApi';
import { formatDate, getSeverityColor, getUserTimezone } from '../utils/dateUtils';

interface AlertTableProps {
  alerts: Alert[];
  isLoading: boolean;
}

// Define the row type to ensure type safety
interface AlertRow {
  id: string;
  event: string;
  headline: string;
  areaDesc: string;
  severity: string;
  effective: string;
  expires: string;
  isTest?: boolean;
}

const AlertTable = ({ alerts, isLoading }: AlertTableProps) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));
  const isExtraLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
  
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([
    {
      field: 'severity',
      sort: 'desc',
    },
  ]);
  const [showExpired, setShowExpired] = useState<boolean>(false);

  // Calculate grid height based on screen size
  const getGridHeight = () => {
    if (isExtraLargeScreen) return '75vh'; // 75% of viewport height on large screens
    if (isLargeScreen) return '70vh'; // 70% of viewport height on medium screens
    return '60vh'; // 60% of viewport height on small screens
  };

  // Filter out expired alerts and test messages
  const filteredAlerts = alerts.filter(alert => {
    const isExpired = new Date(alert.properties.expires) < new Date();
    const isTestMessage = alert.properties.event.toLowerCase().includes('test');
    
    if (!showExpired && isExpired) {
      return false;
    }
    
    // Always filter out test messages regardless of the showExpired setting
    if (isTestMessage) {
      return false;
    }
    
    return true;
  });

  const columns: GridColDef[] = [
    { 
      field: 'event', 
      headerName: 'Event', 
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Typography 
          variant="body2" 
          fontWeight="medium"
          sx={{ lineHeight: 'inherit' }}  // Override default Typography line-height
        >
          {params.value?.toString() || ''}
        </Typography>
      )
    },
    { 
      field: 'headline', 
      headerName: 'Headline', 
      flex: 2,
      minWidth: 200
    },
    { 
      field: 'areaDesc', 
      headerName: 'Area', 
      flex: 1.5,
      minWidth: 150 
    },
    { 
      field: 'severity', 
      headerName: 'Severity', 
      flex: 0.8,
      minWidth: 100,
      renderCell: (params: GridRenderCellParams) => {
        const value = params.value?.toString() || '';
        return (
          <Chip 
            label={value} 
            color={getSeverityColor(value)}
            size="small"
          />
        );
      }
    },
    { 
      field: 'effective', 
      headerName: 'Effective From', 
      flex: 1.2,
      minWidth: 170,
      renderCell: (params: GridRenderCellParams) => {
        // Access the effective date directly from the row data
        const value = (params.row as AlertRow).effective;
        return <span>{value ? formatDate(value, 'MMM dd, yyyy h:mm a') : 'N/A'}</span>;
      }
    },
    { 
      field: 'expires', 
      headerName: 'Expires On', 
      flex: 1.2,
      minWidth: 170,
      renderCell: (params: GridRenderCellParams) => {
        // Access the expires date directly from the row data
        const value = (params.row as AlertRow).expires;
        return <span>{value ? formatDate(value, 'MMM dd, yyyy h:mm a') : 'N/A'}</span>;
      }
    },
  ];

  // Make sure we're extracting the date values correctly from the API response
  const rows: AlertRow[] = filteredAlerts.map((alert) => {
    const isTestMessage = alert.properties.event.toLowerCase().includes('test');
    
    return {
      id: alert.properties.id,
      event: alert.properties.event,
      headline: alert.properties.headline,
      areaDesc: alert.properties.areaDesc,
      severity: alert.properties.severity,
      effective: alert.properties.effective,
      expires: alert.properties.expires,
      isTest: isTestMessage
    };
  });

  const userTimezone = getUserTimezone();

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        mb: 2,
        gap: 1
      }}>
        <Typography variant="body2" color="text.secondary">
          All times shown in {userTimezone}
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={showExpired}
              onChange={(e) => setShowExpired(e.target.checked)}
              color="primary"
            />
          }
          label="Show Expired Alerts"
        />
      </Box>
      
      <Paper elevation={2} sx={{ height: getGridHeight(), width: '100%', overflow: 'auto' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={isLoading}
          filterModel={filterModel}
          onFilterModelChange={setFilterModel}
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          disableRowSelectionOnClick
          onRowClick={(params) => navigate(`/alert/${params.id}`)}
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              printOptions: { disableToolbarButton: true },
              csvOptions: {  // CSV export options
                fileName: 'weather-alerts'
              },
              sx: {
                '& .MuiFormControl-root': {
                  width: { xs: '100%', sm: 'auto' }
                }
              }
            },
          }}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          getRowClassName={(params) => {
            const severity = (params.row as AlertRow).severity.toLowerCase();
            if (severity === 'severe' || severity === 'extreme') {
              return 'severity-severe-row';
            } else if (severity === 'moderate') {
              return 'severity-moderate-row';
            } else if (severity === 'minor') {
              return 'severity-minor-row';
            }
            return '';
          }}
          sx={{
            '& .severity-severe-row': {
              backgroundColor: 'rgba(211, 47, 47, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(211, 47, 47, 0.2)',
              },
            },
            '& .severity-moderate-row': {
              backgroundColor: 'rgba(255, 152, 0, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255, 152, 0, 0.2)',
              },
            },
            '& .severity-minor-row': {
              backgroundColor: 'rgba(3, 169, 244, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(3, 169, 244, 0.2)',
              },
            },
            '& .MuiDataGrid-toolbarContainer': {
              padding: 2,
              gap: 2,
              flexWrap: 'wrap',
            },
            '& .MuiDataGrid-main': {
              width: '100%',
            },
            '& .MuiDataGrid-root': {
              border: 'none',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid rgba(224, 224, 224, 0.5)',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
              borderBottom: '1px solid rgba(224, 224, 224, 1)',
            },
            '& .MuiDataGrid-virtualScroller': {
              backgroundColor: 'transparent',
            },
            width: '100%',
            height: '100%',
          }}
        />
      </Paper>
    </Box>
  );
};

export default AlertTable;
