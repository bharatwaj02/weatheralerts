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
 * @returns Promise with the alerts data
 */
export const fetchAlerts = async (): Promise<Alert[]> => {
  try {
    const url = `${API_BASE_URL}/alerts/active`;
    console.log('Fetching alerts from URL:', url);
    
    const response = await axios.get<AlertsResponse>(url);
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
    // Use the regular alerts endpoint for fetching by ID
    const response = await axios.get<Alert>(`${API_BASE_URL}/alerts/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching alert with ID ${id}:`, error);
    throw error;
  }
};
