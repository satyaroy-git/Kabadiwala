import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MapPlaceholderProps {
  latitude: number;
  longitude: number;
  label?: string;
  destLatitude?: number;
  destLongitude?: number;
  destLabel?: string;
}

export function MapPlaceholder({ latitude, longitude, label, destLatitude, destLongitude, destLabel }: MapPlaceholderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.mapBg}>
        {/* Grid lines to simulate map */}
        <View style={styles.gridH} />
        <View style={styles.gridH2} />
        <View style={styles.gridV} />
        <View style={styles.gridV2} />
        
        {/* Current location pin */}
        <View style={[styles.pin, { top: '40%', left: '45%' }]}>
          <Text style={styles.pinIcon}>📍</Text>
          {label && <Text style={styles.pinLabel}>{label}</Text>}
        </View>

        {/* Destination pin */}
        {destLatitude && (
          <View style={[styles.pin, { top: '65%', left: '55%' }]}>
            <Text style={styles.pinIcon}>🏠</Text>
            {destLabel && <Text style={styles.pinLabel}>{destLabel}</Text>}
          </View>
        )}

        {/* Route line (simulated) */}
        {destLatitude && (
          <View style={styles.routeLine} />
        )}
      </View>

      {/* Coordinates display */}
      <View style={styles.coordsBar}>
        <Text style={styles.coordsText}>
          📍 {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </Text>
        {destLatitude && (
          <Text style={styles.coordsText}>
            🏠 {destLatitude.toFixed(4)}, {destLongitude?.toFixed(4)}
          </Text>
        )}
      </View>

      {/* Upgrade note */}
      <View style={styles.upgradeNote}>
        <Text style={styles.upgradeText}>
          📍 Live GPS tracking active • Upgrade to Google Maps in production build
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8F5E9' },
  mapBg: { flex: 1, position: 'relative', overflow: 'hidden' },
  gridH: { position: 'absolute', top: '33%', left: 0, right: 0, height: 1, backgroundColor: 'rgba(0,0,0,0.05)' },
  gridH2: { position: 'absolute', top: '66%', left: 0, right: 0, height: 1, backgroundColor: 'rgba(0,0,0,0.05)' },
  gridV: { position: 'absolute', top: 0, bottom: 0, left: '33%', width: 1, backgroundColor: 'rgba(0,0,0,0.05)' },
  gridV2: { position: 'absolute', top: 0, bottom: 0, left: '66%', width: 1, backgroundColor: 'rgba(0,0,0,0.05)' },
  pin: { position: 'absolute', alignItems: 'center' },
  pinIcon: { fontSize: 32 },
  pinLabel: { fontSize: 10, color: '#333', fontWeight: '600', marginTop: 2 },
  routeLine: { position: 'absolute', top: '45%', left: '47%', width: 80, height: 2, backgroundColor: '#4CAF50', transform: [{ rotate: '45deg' }] },
  coordsBar: { flexDirection: 'row', justifyContent: 'space-between', padding: 8, backgroundColor: 'rgba(255,255,255,0.9)' },
  coordsText: { fontSize: 11, color: '#666' },
  upgradeNote: { padding: 6, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  upgradeText: { fontSize: 10, color: '#999', textAlign: 'center' },
});
