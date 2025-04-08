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
import { Box, Chip, Typography, Paper, useTheme, useMediaQuery } from '@mui/material';
import { Alert } from '../services/weatherApi';
import { formatDate, getSeverityColor, getUserTimezone } from '../utils/dateUtils';
import { isWithinInterval } from 'date-fns';

interface AlertTableProps {
  alerts: Alert[];
  isLoading: boolean;
  selectedState?: string;
  dateRange?: [Date | null, Date | null];
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

const AlertTable = ({ alerts, isLoading, selectedState = '', dateRange }: AlertTableProps) => {
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

  /**
   * Implements custom sorting for severity levels
   * Order: Extreme > Severe > Moderate > Minor > Unknown
   */
  const severitySortComparator = (v1: string, v2: string) => {
    const severityOrder = ['Extreme', 'Severe', 'Moderate', 'Minor', 'Unknown'];
    const index1 = severityOrder.indexOf(v1) !== -1 ? severityOrder.indexOf(v1) : severityOrder.length;
    const index2 = severityOrder.indexOf(v2) !== -1 ? severityOrder.indexOf(v2) : severityOrder.length;
    return index2 - index1;
  };

  /** Responsive grid height calculation based on viewport size */
  const getGridHeight = () => {
    if (isExtraLargeScreen) return '75vh'; 
    if (isLargeScreen) return '70vh'; // 70% of viewport height on medium screens
    return '60vh'; // 60% of viewport height on small screens
  };

  /** 
   * Filters alerts based on:
   * 1. Excluding test messages
   * 2. State selection
   * 3. Date range
   */
  const filteredAlerts = alerts.filter(alert => {
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
    if (dateRange && dateRange[0] && dateRange[1]) {
      const alertDate = new Date(alert.properties.effective);
      const startDate = dateRange[0];
      const endDate = dateRange[1];
      
      if (!isWithinInterval(alertDate, { start: startDate, end: endDate })) {
        return false;
      }
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
      sortComparator: severitySortComparator, // Apply custom sort comparator
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
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          All times shown in {userTimezone}
        </Typography>
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
