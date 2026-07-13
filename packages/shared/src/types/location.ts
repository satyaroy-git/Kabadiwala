export interface LocationUpdate {
  id: string;
  booking_id: string;
  kabadiwala_id: string;
  lat: number;
  lng: number;
  heading: number | null;
  speed: number | null; // km/h
  accuracy: number | null; // meters
  timestamp: string;
}

export interface TrackingInfo {
  booking_id: string;
  kabadiwala_id: string;
  kabadiwala_name: string;
  kabadiwala_phone: string;
  kabadiwala_photo: string | null;
  current_location: {
    lat: number;
    lng: number;
  };
  destination: {
    lat: number;
    lng: number;
    address: string;
  };
  eta_minutes: number | null;
  distance_km: number | null;
  status: 'en_route' | 'arrived' | 'nearby'; // nearby = within 200m
}

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}
