import React, { useMemo, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Platform, Image } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

// Constants
const KHARIS_YELLOW = '#FFCC00';
const KHARIS_GRAY = '#777777';
const KHARIS_DARK = '#333333';

// Conditionally import MapView based on platform
let MapView, Polyline, Marker, Callout;
if (Platform.OS !== 'web') {
  // Only import on native platforms
  try {
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Polyline = Maps.Polyline;
    Marker = Maps.Marker;
    Callout = Maps.Callout;
  } catch (e) {
    console.log('Could not load react-native-maps:', e);
  }
}

// Path simplification algorithm (Ramer-Douglas-Peucker)
const simplifyPath = (points, tolerance) => {
  if (points.length <= 2) return points;
  
  // Find the point with the maximum distance
  let maxDistance = 0;
  let maxDistanceIndex = 0;
  
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  
  for (let i = 1; i < points.length - 1; i++) {
    const distance = perpendicularDistance(points[i], firstPoint, lastPoint);
    if (distance > maxDistance) {
      maxDistance = distance;
      maxDistanceIndex = i;
    }
  }
  
  // If the max distance is greater than the tolerance, recursively simplify
  if (maxDistance > tolerance) {
    const firstSegment = simplifyPath(points.slice(0, maxDistanceIndex + 1), tolerance);
    const secondSegment = simplifyPath(points.slice(maxDistanceIndex), tolerance);
    
    // Concat the two simplified segments (removing the duplicate point)
    return firstSegment.slice(0, -1).concat(secondSegment);
  } else {
    // If no point exceeds the tolerance, return the end points
    return [firstPoint, lastPoint];
  }
};

const perpendicularDistance = (point, lineStart, lineEnd) => {
  const lat = point.latitude;
  const lng = point.longitude;
  const lat1 = lineStart.latitude;
  const lng1 = lineStart.longitude;
  const lat2 = lineEnd.latitude;
  const lng2 = lineEnd.longitude;
  
  if (lat1 === lat2 && lng1 === lng2) {
    return calculateDistance(lat, lng, lat1, lng1);
  }
  
  const a = lat - lat1;
  const b = lng - lng1;
  const c = lat2 - lat1;
  const d = lng2 - lng1;
  
  const dot = a * c + b * d;
  const lengthSquared = c * c + d * d;
  let param = dot / lengthSquared;
  
  let xx, yy;
  
  if (param < 0) {
    xx = lat1;
    yy = lng1;
  } else if (param > 1) {
    xx = lat2;
    yy = lng2;
  } else {
    xx = lat1 + param * c;
    yy = lng1 + param * d;
  }
  
  return calculateDistance(lat, lng, xx, yy);
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance / 1000; // Convert to kilometers
};

// Create a MapComponent that handles platform differences
export const MapComponent = React.memo(({ children, ...props }) => {
  const isNative = Platform.OS !== 'web';
  
  if (!isNative) {
    return (
      <View style={styles.webMapFallback}>
        <View style={styles.webMapContent}>
          <FontAwesome5 name="map-marked-alt" size={48} color={KHARIS_YELLOW} />
          <Text style={styles.webMapTitle}>Map View</Text>
          <Text style={styles.webMapText}>
            The full map experience is available on mobile devices.
            Web version shows a simplified interface.
          </Text>
          {props.currentRegion && (
            <View style={styles.webMapLocationInfo}>
              <Text style={styles.webMapLocationTitle}>Current Location</Text>
              <Text style={styles.webMapLocationCoords}>
                {props.currentRegion.latitude.toFixed(6)}, {props.currentRegion.longitude.toFixed(6)}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }
  
  // Don't try to render MapView if it's not available
  if (!MapView) {
    return (
      <View style={[styles.webMapFallback, {backgroundColor: '#f0f0f0'}]}>
        <Text>Map not available</Text>
      </View>
    );
  }

  // Performance optimized MapView with limited redraws
  return (
    <MapView 
      {...props}
      onMapReady={props.onMapReady}
      moveOnMarkerPress={false}
      showsPointsOfInterest={false} // Reduces map complexity
      showsBuildings={false} // Reduces map complexity
      rotateEnabled={false} // Reduces interaction complexity
      loadingEnabled={true} // Shows loading indicator while map loads
    >
      {children}
    </MapView>
  );
});

// Optimized polyline for prayer walk paths
export const MapPolyline = React.memo(({ coordinates, strokeColor, strokeWidth, simplifyTolerance = 0.0001 }) => {
  const isNative = Platform.OS !== 'web';
  
  // Skip rendering on web
  if (!isNative || !Polyline) return null;
  
  // Simplify path to improve performance with many points
  const simplifiedCoordinates = useMemo(() => {
    if (!coordinates || coordinates.length < 3) return coordinates;
    
    // For short paths, don't simplify
    if (coordinates.length < 50) return coordinates;
    
    return simplifyPath(coordinates, simplifyTolerance);
  }, [coordinates, simplifyTolerance]);
  
  return (
    <Polyline
      coordinates={simplifiedCoordinates}
      strokeColor={strokeColor || KHARIS_YELLOW}
      strokeWidth={strokeWidth || 5}
      lineDashPattern={[0]}
      lineCap="round"
      lineJoin="round"
    />
  );
});

// Optimized marker
export const MapMarker = React.memo(({ coordinate, title, children }) => {
  const isNative = Platform.OS !== 'web';
  
  // Skip rendering on web
  if (!isNative || !Marker) return null;
  
  return (
    <Marker
      coordinate={coordinate}
      title={title}
      tracksViewChanges={false} // Important for performance when marker doesn't change
    >
      {children}
    </Marker>
  );
});

// Marker clustering implementation for admin view
export const MapMarkerCluster = ({ markers, region }) => {
  const isNative = Platform.OS !== 'web';
  
  // Skip rendering on web
  if (!isNative || !Marker) return null;
  
  // Simple clustering algorithm based on region size
  const clusteredMarkers = useMemo(() => {
    if (!markers || markers.length === 0) return [];
    if (markers.length < 10) return markers; // Don't cluster small sets
    
    const clusters = [];
    const clusterRadius = (region.latitudeDelta * 0.05);
    const markersToProcess = [...markers];
    
    while (markersToProcess.length > 0) {
      const marker = markersToProcess.pop();
      let cluster = {
        coordinate: marker.coordinate,
        count: 1,
        points: [marker]
      };
      
      // Check if this marker can join an existing cluster
      let i = 0;
      while (i < markersToProcess.length) {
        const otherMarker = markersToProcess[i];
        const distance = calculateDistance(
          marker.coordinate.latitude, 
          marker.coordinate.longitude,
          otherMarker.coordinate.latitude,
          otherMarker.coordinate.longitude
        );
        
        // If close enough, add to current cluster
        if (distance < clusterRadius) {
          cluster.count++;
          cluster.points.push(otherMarker);
          markersToProcess.splice(i, 1);
        } else {
          i++;
        }
      }
      
      clusters.push(cluster);
    }
    
    return clusters;
  }, [markers, region]);
  
  return (
    <>
      {clusteredMarkers.map((cluster, index) => (
        <Marker
          key={`cluster-${index}`}
          coordinate={cluster.coordinate}
          tracksViewChanges={false}
        >
          {cluster.count > 1 ? (
            <View style={styles.clusterMarker}>
              <Text style={styles.clusterMarkerText}>{cluster.count}</Text>
            </View>
          ) : (
            <View style={styles.customMarker}>
              <FontAwesome5 name="praying-hands" size={14} color="#fff" />
            </View>
          )}
        </Marker>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  // Web-specific map fallback
  webMapFallback: {
    flex: 1,
    backgroundColor: '#f5f5f7',
    borderRadius: 8,
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webMapContent: {
    padding: 20,
    alignItems: 'center',
    maxWidth: 400,
  },
  webMapTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: KHARIS_DARK,
  },
  webMapText: {
    fontSize: 16,
    textAlign: 'center',
    color: KHARIS_GRAY,
    marginBottom: 16,
    lineHeight: 22,
  },
  webMapLocationInfo: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    marginTop: 16,
  },
  webMapLocationTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: KHARIS_DARK,
  },
  webMapLocationCoords: {
    fontSize: 14,
    color: KHARIS_GRAY,
  },
  customMarker: {
    backgroundColor: KHARIS_YELLOW,
    borderRadius: 15,
    padding: 8,
    borderWidth: 3,
    borderColor: '#fff',
  },
  clusterMarker: {
    backgroundColor: KHARIS_YELLOW,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  clusterMarkerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  }
});