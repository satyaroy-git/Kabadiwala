import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { MapPlaceholder } from './MapPlaceholder';

// Dynamic import - react-native-maps only works in custom dev builds, not Expo Go
let RNMapView: any = null;
let RNMarker: any = null;
let RNPolyline: any = null;

try {
  const Maps = require('react-native-maps');
  RNMapView = Maps.default;
  RNMarker = Maps.Marker;
  RNPolyline = Maps.Polyline;
} catch (e) {
  // react-native-maps not available (e.g., Expo Go) — will use fallback
}

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  emoji?: string;
  color?: string;
}

export interface MapRoute {
  coordinates: { latitude: number; longitude: number }[];
  color?: string;
  width?: number;
}

export interface KabadiwalaMapViewProps {
  latitude: number;
  longitude: number;
  markers?: MapMarker[];
  route?: MapRoute;
  zoomLevel?: number;
  showsUserLocation?: boolean;
  style?: any;
  onMapReady?: () => void;
}

export function KabadiwalaMapView({
  latitude,
  longitude,
  markers = [],
  route,
  zoomLevel = 15,
  showsUserLocation = false,
  style,
  onMapReady,
}: KabadiwalaMapViewProps) {
  const mapRef = useRef<any>(null);
  const [mapsAvailable, setMapsAvailable] = useState<boolean>(!!RNMapView);

  // Fit map to show all markers
  useEffect(() => {
    if (mapsAvailable && mapRef.current && markers.length > 1) {
      const coords = markers.map((m) => ({
        latitude: m.latitude,
        longitude: m.longitude,
      }));
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(coords, {
          edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
          animated: true,
        });
      }, 500);
    }
  }, [markers, mapsAvailable]);

  // Fallback to MapPlaceholder if react-native-maps is not available
  if (!mapsAvailable || !RNMapView) {
    // Extract data for the placeholder
    const destMarker = markers.find((m) => m.id !== 'current');
    return (
      <View style={[styles.container, style]}>
        <MapPlaceholder
          latitude={latitude}
          longitude={longitude}
          label={markers.find((m) => m.id === 'current')?.title || 'Current'}
          destLatitude={destMarker?.latitude}
          destLongitude={destMarker?.longitude}
          destLabel={destMarker?.title}
        />
      </View>
    );
  }

  // Real Google Maps
  const latitudeDelta = 0.01 * (16 / zoomLevel);
  const longitudeDelta = 0.01 * (16 / zoomLevel);

  return (
    <View style={[styles.container, style]}>
      <RNMapView
        ref={mapRef}
        style={styles.map}
        provider="google"
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta,
          longitudeDelta,
        }}
        region={{
          latitude,
          longitude,
          latitudeDelta,
          longitudeDelta,
        }}
        showsUserLocation={showsUserLocation}
        showsMyLocationButton={true}
        showsCompass={true}
        onMapReady={onMapReady}
      >
        {/* Markers */}
        {markers.map((marker) => (
          <RNMarker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={marker.title}
            description={marker.description}
            pinColor={marker.color || (marker.id === 'current' ? 'green' : 'red')}
          />
        ))}

        {/* Route polyline */}
        {route && route.coordinates.length > 1 && (
          <RNPolyline
            coordinates={route.coordinates}
            strokeColor={route.color || '#4CAF50'}
            strokeWidth={route.width || 4}
            lineDashPattern={[0]}
          />
        )}
      </RNMapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
