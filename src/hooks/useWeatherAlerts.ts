import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAlerts, fetchAlertById, Alert, AlertsParams } from '../services/weatherApi';

/**
 * Custom hook to fetch and manage weather alerts
 */
export const useWeatherAlerts = () => {
  return useQuery<Alert[]>({
    queryKey: ['alerts'],
    queryFn: fetchAlerts,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Custom hook to fetch a specific alert by ID
 * @param id - Alert ID
 */
export const useWeatherAlert = (id: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['alert', id],
    queryFn: () => fetchAlertById(id!),
    enabled: !!id, // Only fetch if ID is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    initialData: () => {
      // Check if we already have the alert in the cache
      const alerts = queryClient.getQueryData<Alert[]>(['alerts']);
      if (!alerts) return undefined;
      
      return alerts.find(alert => alert.properties.id === id);
    },
  });
};
