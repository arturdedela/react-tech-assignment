# Flight Radar - Interview Task

## Interview Task

This repository provides the backend for an interview exercise where a candidate builds a web frontend.

The expected frontend should include:

- The frontend should be built in the `fe` folder of this
- Using `React` with `TypeScript`
- Map view that plots planes in real time. Possible options could be e.g. `MapLibre`, `MapBox`, `Leaflet` or any other map engine provider of your choice.
- Planes can be selected/unselected to show/hide detailed information
- Consumes flight data exclusively from the provided WebSocket backend

## Backend

### Prerequisites

- Node.js 18+
- npm

### Install & Start

```bash
cd be
npm install
npm run dev
```

The server listens at `ws://localhost:4000` by default.

#### Configuration

Create `be/.env` by copying the `be/.env.example` file:

```env
PORT=4000
PLANES_COUNT=20
BASIC_UPDATE_INTERVAL_MS=1000
DETAILED_UPDATE_INTERVAL_MS=1000
```

#### Environment variable description

- `PORT`: WebSocket server port
- `PLANES_COUNT`: Number of simulated planes
- `BASIC_UPDATE_INTERVAL_MS`: Basic data broadcast interval (ms)
- `DETAILED_UPDATE_INTERVAL_MS`: Detailed data interval (ms)

#### Endpoint: `/ws/planes/basic` - Broadcasts all planes to all clients

The server sends this response on ever configured `BASIC_UPDATE_INTERVAL_MS`.

```json
{
  "type": "planes",
  "data": [
    {
      "id": "plane-1",
      "latitude": 45.1234,
      "longitude": -75.5678,
      "altitude": 10668,
      "color": "#FF6B6B"
    }
  ]
}
```

#### Endpoint: `/ws/planes/details` — detailed info for a single subscribed plane

In order to receive detailed plane information, the client must subscribe by sending the request:

```json
{ 
  "type": "subscribe", 
  "planeId": "plane-1"
}
```

When subscribed, the server will send the following response:

```json
{
  "type": "plane-details",
  "data": {
    "id": "plane-1",
    "model": "Boeing 737",
    "airline": "Airline Name",
    "flightNumber": "AA123",
    "registration": "N12345",
    "latitude": 45.1234,
    "longitude": -75.5678,
    "altitude": 10668,
    "speed": 283,
    "heading": 180,
    "verticalSpeed": 0,
    "origin": { "airport": "JFK", "city": "New York" },
    "destination": { "airport": "LAX", "city": "Los Angeles" },
    "flightDuration": 125,
    "estimatedArrival": 3600,
    "numberOfPassengers": 180,
    "maxPassengers": 200,
    "status": "cruising",
    "color": "#FF6B6B"
  }
}
```

The server sends this response on ever configured `DETAILED_UPDATE_INTERVAL_MS`

#### Errors

```json
{ 
  "type": "error", 
  "message": "Plane plane-1 not found"
}
```

```json
{ 
  "type": "error", 
  "message": "Invalid message format. Expected { type: 'subscribe', planeId: string }"
}
```

```json
{ 
  "type": "error",
  "message": "Invalid JSON message"
}
```

#### Notes

- Send a `subscribe` message after connecting.
- Send a new `subscribe` to switch planes.
- Invalid plane IDs close the connection (code 1008) after an error message.
- Initial plane data (basic) is sent immediately, then updates at the configured interval.

### Data Models

These are the data models returned by the backend:

```typescript
type PlaneBasic = {
  id: string;
  latitude: number;
  longitude: number;
  altitude: number;
  color: string;
};

type PlaneDetailed = {
  id: string;
  model: string;
  airline: string;
  flightNumber: string;
  registration: string;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  heading: number;
  verticalSpeed: number;
  origin: { 
    airport: string; 
    city: string
  };
  destination: { 
    airport: string; 
    city: string
  };
  flightDuration: number;
  estimatedArrival: number;
  numberOfPassengers: number;
  maxPassengers: number;
  status: "departed" | "enroute" | "cruising" | "landing";
  color: string;
};
```
