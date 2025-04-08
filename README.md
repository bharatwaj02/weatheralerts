# Weather Alerts App

The Weather Alerts App is a web application that displays active weather alerts on an interactive map. It provides features to view alert summaries, filter alerts by area or date, and explore individual alerts in detail, including their geographic impact.

## Features

- **View Active Alerts**: Displays a list of all active weather alerts.
- **Filter Alerts**:
  - By Area: Narrow down alerts based on specific geographic regions.
  - By Date: Filter alerts based on their issuance or expiration dates.
- **Interactive Map**:
  - Displays the affected area of an alert using Leaflet and OpenStreetMap.
  - Highlights the alert's geographic region with polygons.
- **Alert Details**: Click on an alert to view its detailed information, including the affected area on the map.

## Technology Stack

- **Frontend**: React with TypeScript
- **Mapping**: Leaflet with OpenStreetMap tiles
- **UI Components**: Material-UI (MUI)
- **API Integration**: Fetches weather alert data from the National Weather Service API.

## Components

### `AlertMap`
- Displays an interactive map showing the geographic impact of a selected alert.
- Uses Leaflet to render polygons for areas affected by the alert.
- Automatically adjusts the map view to fit the bounds of the affected area.

### Other Components
- **Alert List**: Displays a summary of all active alerts.
- **Filters**: Allows users to filter alerts by area or date.
- **Alert Details**: Shows detailed information about a selected alert.

## How to Run the Project

1. Clone the repository:
   ```bash
   git clone https://github.com/bharatwaj02/weatheralerts.git
   cd weatheralerts
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open the app in your browser:
   ```
   http://localhost:3000
   ```

## Folder Structure

```
src/
├── components/
│   ├── AlertMap.tsx       # Displays the map for an alert
│   ├── AlertList.tsx      # Lists all active alerts
│   ├── Filters.tsx        # Provides filtering options
│   └── AlertDetails.tsx   # Displays detailed information about an alert
├── services/
│   └── weatherApi.ts      # API integration for fetching weather alerts
└── App.tsx                # Main application component
```

## Map Integration

The app uses **Leaflet** for rendering maps and **OpenStreetMap** for tile layers. The `AlertMap` component dynamically updates the map based on the selected alert's geographic data.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to improve the app.

## License

This project is licensed under the MIT License.
