import axios from 'axios';

const API_BASE_URL = 'https://api.weather.gov';

// Types for the API responses
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
    UGC: string[];
    SAME: string[];
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
  status?: 'actual' | 'exercise' | 'system' | 'test' | 'draft';
  message_type?: 'alert' | 'update' | 'cancel';
  event?: string;
  code?: string;
  active?: boolean; // This is not used directly as a query param but to determine endpoint
}

/**
 * Fetch weather alerts from the National Weather Service API
 * @param params - Query parameters for filtering alerts
 * @returns Promise with the alerts data
 */
export const fetchAlerts = async (params: AlertsParams = {}): Promise<Alert[]> => {
  try {
    // If active is true, use the /alerts/active endpoint, otherwise use /alerts
    const endpoint = params.active ? '/alerts/active' : '/alerts';
    
    // Build query parameters - remove 'active' as it's not a valid query parameter
    const { active, area, ...otherParams } = params;
    
    // Create a clean query params object without any empty values
    const queryParams: Record<string, string> = {};
    
    // Only add non-empty parameters
    Object.entries(otherParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams[key] = String(value);
      }
    });
    
    // Add area filter if provided and not empty
    let url = `${API_BASE_URL}${endpoint}`;
    if (area && area.trim() !== '') {
      // If area is provided, use it as a path parameter for state alerts
      url = `${API_BASE_URL}/alerts/active/area/${area}`;
    }
    
    console.log('Fetching alerts from URL:', url, 'with params:', queryParams);
    
    const response = await axios.get<AlertsResponse>(url, { 
      params: queryParams
    });
    
    return response.data.features;
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
    const response = await axios.get<Alert>(`${API_BASE_URL}/alerts/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching alert with ID ${id}:`, error);
    throw error;
  }
};
