import axios from 'axios';

const API_BASE_URL = 'https://api.weather.gov';

export interface AlertProperties {
  '@id': string;
  id: string;
  areaDesc: string;
  sent: string;
  effective: string;
  onset: string;
  expires: string;
  ends: string;
  status: string;
  messageType: string;
  category: string;
  severity: string;
  certainty: string;
  urgency: string;
  event: string;
  sender: string;
  senderName: string;
  headline: string;
  description: string;
  instruction: string;
  response: string;
  parameters: Record<string, string[]>;
  affectedZones: string[];
  geocode: {
    UGC: string[]; // UGC: Universal Geographic Code - used by NWS to identify forecast zones and counties
    SAME: string[];// SAME: Specific Area Message Encoding - used in Emergency Alert System broadcasts
  };
}

export interface Alert {
  id: string;
  type: string;
  properties: AlertProperties;
  geometry?: {
    type: string;
    coordinates: number[][];
  };
}

export interface AlertsResponse {
  '@context': any;
  type: string;
  features: Alert[];
  title: string;
  updated: string;
}

// Parameters for fetching alerts
export interface AlertsParams {
  area?: string;
  start?: string;
  end?: string;
}

/**
 * Fetch weather alerts from the National Weather Service API
 * @param params - Query parameters for filtering alerts
 * @returns Promise with the alerts data
 */
export const fetchAlerts = async (params: AlertsParams = {}): Promise<Alert[]> => {
  try {
    const { area, start, end } = params;
    
    let url = `${API_BASE_URL}/alerts/active`;
    if (area && area.trim() !== '') {
      url = `${API_BASE_URL}/alerts/active/area/${area}`;
    }
    
    console.log('Fetching alerts from URL:', url);
    
    const response = await axios.get<AlertsResponse>(url);
    let alerts = response.data.features;
    
    // Applying all filtering client-side
    alerts = alerts.filter(alert => {
      // Filter by date range if provided
      if (start || end) {
        const effectiveDate = new Date(alert.properties.effective).getTime();
        const startDate = start ? new Date(start).getTime() : 0;
        const endDate = end ? new Date(end).getTime() : Infinity;
        if (effectiveDate < startDate || effectiveDate > endDate) {
          return false;
        }
      }
      
      // Filter out test messages
      const isTestMessage = alert.properties.status.toLowerCase() === 'test';
      if (isTestMessage) {
        return false;
      }
      
      return true;
    });
    
    console.log(`Found ${alerts.length} matching alerts`);
    return alerts;
  } catch (error) {
    console.error('Error fetching alerts:', error);
    throw error;
  }
};

/**
 * Fetch a specific alert by ID
 * @param id - Alert ID
 * @returns Promise with the alert data
 */
export const fetchAlertById = async (id: string): Promise<Alert> => {
  try {
    // Use the regular alerts endpoint for fetching by ID
    const response = await axios.get<Alert>(`${API_BASE_URL}/alerts/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching alert with ID ${id}:`, error);
    throw error;
  }
};
