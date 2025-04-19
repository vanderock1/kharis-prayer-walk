import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { supabase } from '../utils/supabase';
import { 
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Platform,
  ActivityIndicator,
  StatusBar,
  TextInput,
  Switch,
  KeyboardAvoidingView,
  InteractionManager
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5, Ionicons, MaterialCommunityIcons, Feather, AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Alert } from 'react-native';

// Create a toast helper to match the previous API
const toast = {
  success: (message: string) => Alert.alert('Success', message),
  error: (message: string) => Alert.alert('Error', message)
};
import * as Location from 'expo-location';
import { Picker } from '@react-native-picker/picker';

// Import map components from separate file
import { MapComponent, MapPolyline, MapMarker, MapMarkerCluster } from '../components/MapComponents';

const { width, height } = Dimensions.get('window');

// Mock data for walks
const mockHistoryData = [
  {
    id: '1',
    user: 'John D.',
    date: '2025-02-25',
    distance: 3.2,
    time: '32:15',
    path: [
      { latitude: 37.78825, longitude: -122.4324 },
      { latitude: 37.78925, longitude: -122.4344 },
      { latitude: 37.79025, longitude: -122.4354 },
      { latitude: 37.79125, longitude: -122.4364 },
    ],
  },
  {
    id: '2',
    user: 'Mary S.',
    date: '2025-02-24',
    distance: 2.8,
    time: '28:42',
    path: [
      { latitude: 37.78825, longitude: -122.4324 },
      { latitude: 37.78725, longitude: -122.4314 },
      { latitude: 37.78625, longitude: -122.4304 },
    ],
  },
  {
    id: '3',
    user: 'Peter L.',
    date: '2025-02-23',
    distance: 5.1,
    time: '54:30',
    path: [
      { latitude: 37.78825, longitude: -122.4324 },
      { latitude: 37.78925, longitude: -122.4334 },
      { latitude: 37.79025, longitude: -122.4344 },
      { latitude: 37.79125, longitude: -122.4354 },
      { latitude: 37.79225, longitude: -122.4364 },
    ],
  },
];

// Mock users for login
const mockUsers = [
  { id: '1', username: 'john', password: 'password123', name: 'John Doe', isAdmin: false },
  { id: '2', username: 'mary', password: 'password123', name: 'Mary Smith', isAdmin: false },
  { id: '3', username: 'admin', password: 'kharis', name: 'Admin', isAdmin: true },
];

// Logo Component
const LogoSvg = ({ style, width = 100, height = 100 }) => {
  return (
    <View style={[{ width, height }, style]}>
      <View style={{ 
        backgroundColor: KHARIS_YELLOW, 
        width: '100%', 
        height: '100%', 
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <FontAwesome5 
          name="dove" 
          size={width * 0.6} 
          color="white" 
        />
      </View>
    </View>
  );
};

const KHARIS_YELLOW = '#FFCC00';
const KHARIS_YELLOW_DARK = '#E6B800';
const KHARIS_YELLOW_LIGHT = '#FFDB4D';
const KHARIS_DARK = '#333333';
const KHARIS_LIGHT = '#F8F8F8';
const KHARIS_GRAY = '#777777';

// Helper function to format time
const formatTime = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
};

export default function KharisPrayerWalk() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showLogin, setShowLogin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
const [locationConsent, setLocationConsent] = useState(false);
const [branch, setBranch] = useState("Kharis Birmingham");
  
  // Animation values
  
  
  // App state
  const [tab, setTab] = useState('track'); // 'track' or 'history'
  const [isTracking, setIsTracking] = useState(false);
  const [locations, setLocations] = useState([]);
  const [time, setTime] = useState(0);
  const [distance, setDistance] = useState(0);
  const [hasLocationPermission, setHasLocationPermission] = useState(null);
  const [currentRegion, setCurrentRegion] = useState(null);
  const [summaryVisible, setSummaryVisible] = useState(false);
  const [loading, setLoading] = useState(true);  const [walkData, setWalkData] = useState([]);
  const [userWalks, setUserWalks] = useState([]);  const [adminStats, setAdminStats] = useState({
    totalWalks: 0,
    totalDistance: 0,
    avgTime: 0,
  });
  
  const mapRef = useRef(null);
  const timerRef = useRef(null);
  const locationSubscription = useRef(null);  // No custom fonts needed  // Remove legacy Animated timing since we're now using reanimated's entering animation.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Display splash for 2 seconds
    return () => clearTimeout(timeout);
  }, []);  // Get location permission and initial location
  useEffect(() => {
    (async () => {
      if (isAuthenticated) {
        setLoading(true);
        
        if (Platform.OS === 'web') {
          // Use default region for web
          setCurrentRegion({
            latitude: 37.78825,
            longitude: -122.4324,                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                });
          setHasLocationPermission(true);
          setLoading(false);
        } else {
          try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            setHasLocationPermission(status === 'granted');
            
            if (status === 'granted') {
              try {                const currentLocation = await Location.getCurrentPositionAsync({
                  accuracy: Location.Accuracy.Balanced,
                });
                
                setCurrentRegion({
                  latitude: currentLocation.coords.latitude,
                  longitude: currentLocation.coords.longitude,                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                });
              } catch (error) {
                console.error('Error getting current location:', error);
                // Set default region if we can't get the user's location
                setCurrentRegion({
                  latitude: 37.78825,
                  longitude: -122.4324,                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                });
              }
            }
            setLoading(false);
          } catch (error) {
            console.error('Location service error:', error);
            // Set default region if there's an error with location services
            setCurrentRegion({
              latitude: 37.78825,
              longitude: -122.4324,                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                });
            setHasLocationPermission(true);
            setLoading(false);
          }
        }  // Fetch walks from Supabase if authenticated
  if (currentUser) {
    fetchPrayerWalks();
  }
      }
    })();
    
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isAuthenticated, currentUser, walkData]);
  
  // Update stats when walk data changes
  const updateStats = () => {
    const dataToUse = currentUser?.isAdmin ? walkData : userWalks;
    
    if (dataToUse.length === 0) {      setAdminStats({
        totalWalks: 0,
        totalDistance: 0,
        avgTime: "0:00",
      });
      return;
    }
    
    const totalWalks = dataToUse.length;
    const totalDistance = dataToUse.reduce((sum, walk) => sum + walk.distance, 0);
    const avgTime = dataToUse.reduce((sum, walk) => {
      const [mins, secs] = walk.time.split(':');
      return sum + (parseInt(mins) * 60 + parseInt(secs));
    }, 0) / totalWalks;
    
    setAdminStats({
      totalWalks,
      totalDistance: totalDistance.toFixed(1),      avgTime: formatTime(Math.round(avgTime)),
    });
  };  const handleLogin = async () => {
    const email = username.trim();
    const pwd = password.trim();
    
    if (!email || !pwd) {
      toast.error(`Please fill in both email and password`);
      return;
    }
    
    // Use Supabase auth API
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pwd,
    });
    
    if (error) {
      toast.error(`Login error: ${error.message}`);
      return;
    }
    
    if (data?.user) {
      setCurrentUser(data.user);
      setIsAuthenticated(true);
      // For this example, assume admin if email matches a fixed admin email.
      const adminEmail = 'admin@kharis.com';
      const userIsAdmin = data.user.email === adminEmail;
      setCurrentUser(prev => ({ ...prev, isAdmin: userIsAdmin }));
      setTab(userIsAdmin ? 'history' : 'track');
      toast.success(`Welcome back, ${data.user.email}!`);
    }
  };
  
  const handleSignup = async () => {
    const email = username.trim();
    const pwd = password.trim();
    const fullName = name.trim();
    const confirmPwd = confirmPassword.trim();
    if (!locationConsent) {
      toast.error(`You must consent to location data collection to continue`);
      return;
    }
    
    if (!email || !pwd || !fullName || !confirmPwd) {
      toast.error(`Please fill in all fields`);
      return;
    }
    
    if (email.length < 3) {
      toast.error(`Email must be at least 3 characters`);
      return;
    }
    
    if (fullName.length < 2) {
      toast.error(`Full name must be at least 2 characters`);
      return;
    }
    
    if (pwd.length < 6) {
      toast.error(`Password must be at least 6 characters`);
      return;
    }
    
    if (pwd !== confirmPwd) {
      toast.error(`Passwords do not match`);
      return;
    }  // Create new user with Supabase
  const { data, error } = await supabase.auth.signUp(
    {
      email,
      password: pwd,
    },
    {
      data: { full_name: fullName, branch: branch, locationConsent: locationConsent, role: 'member' },
    }
  );
    
  if (error) {
    toast.error(`Signup error: ${error.message}`);
    return;
  }
    
  if (data?.user) {
    // Optionally, update the user profile here with fullName via supabase.auth.updateProfile
    await supabase.auth.updateUser({ 
      data: { full_name: fullName } 
    });
      
    setCurrentUser({ ...data.user, full_name: fullName, isAdmin: false });
      setIsAuthenticated(true);
      setTab('track');
      toast.success(`Account created! Welcome, ${fullName}!`);
    }
  };
  
  // Handle user logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setUsername('');
    setPassword('');
    setIsAdmin(false);
  };  // Start tracking a prayer walk
  const startTracking = async () => {
    if (!hasLocationPermission) {
      toast.error('Location permission is required to track your prayer walk.');
      return;
    }
    
    setIsTracking(true);
    setLocations([]);
    setTime(0);
    setDistance(0);
    
    timerRef.current = setInterval(() => {
      setTime(prevTime => prevTime + 1);
    }, 1000);
    
    if (Platform.OS === 'web') {
      // For web, use browser's geolocation API
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          
          setLocations(prevLocations => {            const updatedLocations = [...prevLocations, newLocation];
            
            // Calculate new distance
            if (prevLocations.length > 0) {
              const prevLocation = prevLocations[prevLocations.length - 1];
              const newSegmentDistance = calculateDistance(
                prevLocation.latitude,
                prevLocation.longitude,
                newLocation.latitude,
                newLocation.longitude
              );
              setDistance(prevDistance => prevDistance + newSegmentDistance);
            }
            
            return updatedLocations;
          });
        },
        (error) => {
          console.error("Error getting location: ", error);
          toast.error("Error tracking location. Please try again.");
        },
        { 
          enableHighAccuracy: true,
          distanceFilter: 5,
          maximumAge: 0,
          timeout: 5000
        }
      );
      
      locationSubscription.current = { remove: () => navigator.geolocation.clearWatch(watchId) };
    } else {
      // For native platforms, use Expo Location
      try {
        locationSubscription.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            distanceInterval: 5, // Update every 5 meters
            timeInterval: 5000, // or every 5 seconds
          },
          (location) => {
            const newLocation = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            };
            
            setLocations(prevLocations => {
              const updatedLocations = [...prevLocations, newLocation];
              
              // Calculate new distance
              if (prevLocations.length > 0) {
                const prevLocation = prevLocations[prevLocations.length - 1];
                const newSegmentDistance = calculateDistance(
                  prevLocation.latitude,
                  prevLocation.longitude,
                  newLocation.latitude,
                  newLocation.longitude
                );
                setDistance(prevDistance => prevDistance + newSegmentDistance);
              }
              
              // Update map view
              mapRef.current?.animateToRegion({
                ...newLocation,                latitudeDelta: 0.0022,
                longitudeDelta: 0.0021,
              });              return updatedLocations;
            });
          }
        );
      } catch (error) {
        console.error("Error setting up location tracking:", error);
        toast.error("Error tracking location. Please try again.");
        setIsTracking(false);
        clearInterval(timerRef.current);
      }
    }
  };  // Stop tracking a prayer walk
  const stopTracking = () => {
    setIsTracking(false);
    clearInterval(timerRef.current);
    
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    
    // Only show summary if there are locations
    if (locations.length > 0) {
      setSummaryVisible(true);
      
      // Fit map to show entire route (only on native platforms)
      if (Platform.OS !== 'web' && mapRef.current && locations.length > 1) {
        setTimeout(() => {
          mapRef.current.fitToCoordinates(locations, {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },            animated: true,
          });
        }, 500);
      }
    }
  };  // Optimized prayer walks fetch with caching
  const fetchPrayerWalks = useCallback(async () => {
    try {
      setLoading(true);
      
      // Create cache key based on user
      const cacheKey = `prayerWalks_${currentUser?.email || 'guest'}_${currentUser?.isAdmin ? 'admin' : 'user'}`;
      
      // Try to get from cache first
      const { getMapCache, setMapCache } = require('../utils/mapCache');
      const cachedData = getMapCache(cacheKey);
      
      if (cachedData) {
        console.log('Using cached prayer walk data');
        setWalkData(cachedData);
        
        // Update filtered user walks
        if (currentUser?.isAdmin) {
          setUserWalks(cachedData);
        } else {
          setUserWalks(cachedData);
        }
        
        // Calculate stats with cached data
        updateStats();
        setLoading(false);
        
        // Still fetch in background to update cache
        fetchWalksFromSupabase(cacheKey, false);
        return;
      }
      
      // No cache, fetch from Supabase
      await fetchWalksFromSupabase(cacheKey, true);
      
    } catch (error) {
      console.error("Error fetching prayer walks:", error);
      toast.error("Failed to load prayer walks data");
      setLoading(false);
    }
  }, [currentUser]);
  
  // Helper function to fetch from Supabase
  const fetchWalksFromSupabase = async (cacheKey, updateUI = true) => {
    try {
      let query = supabase.from('prayer_walks').select('*');
      
      // If user is not admin, filter to only show their walks
      if (currentUser && !currentUser.isAdmin) {
        query = query.eq('user_email', currentUser.email);
      }
      
      const { data, error } = await query.order('date', { ascending: false });
      
      if (error) {
        toast.error(`Error fetching prayer walks: ${error.message}`);
        return;
      }
      
      if (data) {
        // Cache the data
        const { setMapCache } = require('../utils/mapCache');
        setMapCache(cacheKey, data);
        
        if (updateUI) {
          setWalkData(data);
          
          // Update filtered user walks
          if (currentUser?.isAdmin) {
            setUserWalks(data);
          } else {
            setUserWalks(data);
          }
          
          // Calculate stats
          updateStats();
        }
      }
    } catch (error) {
      console.error("Error fetching from Supabase:", error);
      if (updateUI) toast.error("Failed to load prayer walks data");
    } finally {
      if (updateUI) setLoading(false);
    }
  };
  
  const savePrayerWalk = async () => {
    const newWalk = {
      user_email: currentUser.email,
      user_name: currentUser.full_name || currentUser.email,
      date: new Date().toISOString().split('T')[0],
      distance: parseFloat(distance.toFixed(2)),
      time: formatTime(time),
      path: locations,
    };
    
    const { data, error } = await supabase.from('prayer_walks').insert(newWalk);
    if (error) {
      toast.error(`Error saving your prayer walk: ${error.message}`);
      return;
    }
    
    // Refresh local walk data from Supabase
    fetchPrayerWalks();
    toast.success('Your prayer walk has been recorded. Thank you for praying for your community!');
    setSummaryVisible(false);
  };
  
  // Reset tracking state
  const resetTrack = () => {
    setSummaryVisible(false);
    setLocations([]);
    setTime(0);
    setDistance(0);
    
    // Reset map to current location
    if (currentRegion) {
      mapRef.current?.animateToRegion(currentRegion);
    }
  };
  
  // Calculate distance between two coordinates
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
  
  const renderSplashScreen = () => {
  return (
    <View style={styles.splashContainer}>
      <Animated.View
        // Use a predefined entering animation so that reanimated can load it properly.        entering={FadeIn}
        style={styles.splashLogoContainer}
      >          <LogoSvg
            style={styles.splashLogo}
            width={150}
            height={150}
          />
        <Text style={styles.splashText}>KHARIS PRAYER WALK</Text>
      </Animated.View>
    </View>
  );
};  // Render login/signup screen
  const renderAuthScreen = () => {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.authContainer}
      >
        <ScrollView contentContainerStyle={styles.authScrollContainer}>
          <View style={styles.authLogoContainer}>          <LogoSvg
            style={styles.authLogo}
            width={100}
            height={100}
          />
            <Text style={styles.authTitle}>KHARIS</Text>
            <Text style={styles.authSubtitle}>Prayer Walk</Text>
          </View>
          
          <View style={styles.authTabsContainer}>
            <TouchableOpacity
              style={[styles.authTab, showLogin && styles.authActiveTab]}
              onPress={() => setShowLogin(true)}
            >
              <Text style={[styles.authTabText, showLogin && styles.authActiveTabText]}>
                Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.authTab, !showLogin && styles.authActiveTab]}
              onPress={() => {
                setShowLogin(false);
                setIsAdmin(false); // Disable admin toggle on signup
              }}
            >
              <Text style={[styles.authTabText, !showLogin && styles.authActiveTabText]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
          
          {showLogin ? (
            <View style={styles.authFormContainer}>
              <Text style={styles.authFormTitle}>Welcome Back</Text>
              <Text style={styles.authFormSubtitle}>Sign in to your account</Text>
              
              <View style={styles.inputContainer}>
                <Feather name="user" size={20} color={KHARIS_GRAY} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Feather name="lock" size={20} color={KHARIS_GRAY} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
              
              <View style={styles.adminSwitchContainer}>
                <Text style={styles.adminSwitchLabel}>Login as Admin</Text>
                <Switch
                  value={isAdmin}
                  onValueChange={setIsAdmin}
                  trackColor={{ false: '#D1D1D6', true: KHARIS_YELLOW_LIGHT }}
                  thumbColor={isAdmin ? KHARIS_YELLOW : '#F4F3F4'}
                />
              </View>
              
              <TouchableOpacity
                style={styles.authButton}
                onPress={handleLogin}
              >
                <LinearGradient
                  colors={[KHARIS_YELLOW, KHARIS_YELLOW_DARK]}
                  style={styles.authButtonGradient}
                >
                  <Text style={styles.authButtonText}>Login</Text>
                  <Feather name="arrow-right" size={20} color="#fff" style={{marginLeft: 8}} />
                </LinearGradient>
              </TouchableOpacity>              {/* Removed login credentials display */}
            </View>
          ) : (
            <View style={styles.authFormContainer}>
              <Text style={styles.authFormTitle}>Create Account</Text>
              <Text style={styles.authFormSubtitle}>Join the Kharis Prayer Walk community</Text>
              
              <View style={styles.inputContainer}>
                <Feather name="user" size={20} color={KHARIS_GRAY} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Username (min. 3 characters)"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Feather name="user-plus" size={20} color={KHARIS_GRAY} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  value={name}
                  onChangeText={setName}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Feather name="lock" size={20} color={KHARIS_GRAY} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password (min. 6 characters)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>              <View style={styles.inputContainer}>
                <Feather name="check-circle" size={20} color={KHARIS_GRAY} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>
              <View style={styles.inputContainer}>
                <Feather name="info" size={20} color={KHARIS_GRAY} style={styles.inputIcon} />
                <Text style={styles.consentNoteText}>
                  By signing up, you consent to the collection of your location data when you start a prayer walk.
                </Text>
              </View>
              <View style={styles.consentSwitchContainer}>
                <Text style={styles.consentSwitchLabel}>Consent to Location Collection</Text>
                <Switch
                  value={locationConsent}
                  onValueChange={setLocationConsent}
                  trackColor={{ false: '#D1D1D6', true: KHARIS_YELLOW_LIGHT }}
                  thumbColor={locationConsent ? KHARIS_YELLOW : '#F4F3F4'}
                />
              </View>
              <View style={styles.inputContainer}>
                <Feather name="map-pin" size={20} color={KHARIS_GRAY} style={styles.inputIcon} />
                <Picker
                  selectedValue={branch}
                  onValueChange={(itemValue, itemIndex) => setBranch(itemValue)}
                  style={{ flex: 1 }}
                >
                  <Picker.Item label="Kharis Birmingham" value="Kharis Birmingham" />
                  <Picker.Item label="Kharis Brighton" value="Kharis Brighton" />
                  <Picker.Item label="Kharis Bristol" value="Kharis Bristol" />
                  <Picker.Item label="Kharis Chatham" value="Kharis Chatham" />
                  <Picker.Item label="Kharis Chelmsford" value="Kharis Chelmsford" />
                  <Picker.Item label="Kharis Coventry" value="Kharis Coventry" />
                  <Picker.Item label="Kharis Croydon" value="Kharis Croydon" />
                  <Picker.Item label="Kharis London" value="Kharis London" />
                  <Picker.Item label="Kharis Luton" value="Kharis Luton" />
                  <Picker.Item label="Kharis Northampton" value="Kharis Northampton" />
                  <Picker.Item label="Kharis Nottingham" value="Kharis Nottingham" />
                  <Picker.Item label="Kharis Orpington" value="Kharis Orpington" />
                  <Picker.Item label="Kharis Reading" value="Kharis Reading" />
                  <Picker.Item label="Kharis Sierra Leone" value="Kharis Sierra Leone" />
                  <Picker.Item label="KP2 Birmingham" value="KP2 Birmingham" />
                </Picker>
              </View>
              <View style={styles.signupTermsContainer}>
                <FontAwesome5 name="praying-hands" size={16} color={KHARIS_YELLOW} style={{marginRight: 10}} />
                <Text style={styles.signupTermsText}>
                  By signing up, you'll be joining a community of believers tracking prayer walks around the world.
                </Text>
              </View>
              
              <TouchableOpacity
                style={styles.authButton}
                onPress={handleSignup}
              >
                <LinearGradient
                  colors={[KHARIS_YELLOW, KHARIS_YELLOW_DARK]}
                  style={styles.authButtonGradient}
                >
                  <Text style={styles.authButtonText}>Create Account</Text>
                  <Feather name="arrow-right" size={20} color="#fff" style={{marginLeft: 8}} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  };  // Render main track screen
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasLocationPermission(status === 'granted');
    } catch (error) {
      console.error('Error requesting location permission:', error);
      toast.error('Unable to request location permission');
    }
  };

  const renderTrackScreen = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={KHARIS_YELLOW} />
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      );
    }
    
    if (!hasLocationPermission) {
      return (
        <View style={styles.permissionContainer}>
          <FontAwesome5 name="map-marker-alt" size={60} color={KHARIS_YELLOW} />
          <Text style={styles.permissionTitle}>Location Permission Required</Text>
          <Text style={styles.permissionText}>
            Kharis Prayer Walk needs access to your location to track your prayer path.
          </Text>
          <TouchableOpacity 
            style={styles.permissionButton}
            onPress={requestLocationPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <View style={styles.trackContainer}>        {currentRegion && (        <MapComponent
          ref={mapRef}
          style={styles.map}
          initialRegion={currentRegion}
          currentRegion={currentRegion}
          showsUserLocation={Platform.OS !== 'web'}
          followsUserLocation={Platform.OS !== 'web'}
          showsMyLocationButton={Platform.OS !== 'web'}
          showsCompass={Platform.OS !== 'web'}
          showsScale={Platform.OS !== 'web'}
          maxZoomLevel={18} // Limit max zoom for better performance
          minZoomLevel={10} // Set minimum zoom level
          onMapReady={() => console.log('Tracking map ready')}
        >
          {/* Use optimized polyline component */}
          <MapPolyline
            coordinates={locations}
            strokeColor={KHARIS_YELLOW}
            strokeWidth={5}
            simplifyTolerance={0.0002} // Balance between accuracy and performance
          />
          
          {locations.length > 0 && (
            <MapMarker
              coordinate={locations[locations.length - 1]}
              title="Current Position"
            >
              <View style={styles.customMarker}>
                <FontAwesome5 name="praying-hands" size={14} color="#fff" />
              </View>
            </MapMarker>
          )}
        </MapComponent>
        )}
        
        <View style={styles.statsOverlay}>
          <View style={styles.statsItem}>
            <Text style={styles.statsValue}>{distance.toFixed(2)}</Text>
            <Text style={styles.statsLabel}>KM</Text>
          </View>
          <View style={styles.statsItem}>
            <Text style={styles.statsValue}>{formatTime(time)}</Text>
            <Text style={styles.statsLabel}>TIME</Text>
          </View>
        </View>
        
        {summaryVisible ? (
          <View style={styles.summaryOverlay}>
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Text style={styles.summaryTitle}>Prayer Walk Complete</Text>
                <FontAwesome5 name="praying-hands" size={24} color={KHARIS_YELLOW} />
              </View>
              
              <View style={styles.summaryStats}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{distance.toFixed(2)} km</Text>
                  <Text style={styles.summaryLabel}>Distance</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{formatTime(time)}</Text>
                  <Text style={styles.summaryLabel}>Duration</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>
                    {(distance / (time / 3600)).toFixed(2)} km/h
                  </Text>
                  <Text style={styles.summaryLabel}>Avg Pace</Text>
                </View>
              </View>
              
              <View style={styles.summaryActions}>
                <TouchableOpacity 
                  style={[styles.summaryButton, styles.summaryPrimaryButton]}
                  onPress={savePrayerWalk}
                >
                  <Text style={styles.summaryPrimaryButtonText}>Save Prayer Walk</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.summaryButton, styles.summarySecondaryButton]}
                  onPress={resetTrack}
                >
                  <Text style={styles.summarySecondaryButtonText}>Discard</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.trackActionsContainer}>
            {!isTracking ? (
              <TouchableOpacity 
                style={styles.startButton}
                onPress={startTracking}
              >
                <LinearGradient
                  colors={[KHARIS_YELLOW, KHARIS_YELLOW_DARK]}
                  style={styles.startButtonGradient}
                >
                  <Text style={styles.startButtonText}>Start Prayer Walk</Text>
                  <FontAwesome5 name="praying-hands" size={18} color="#fff" style={styles.startButtonIcon} />
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.stopButton}
                onPress={stopTracking}
              >
                <LinearGradient
                  colors={['#FF4136', '#E7040F']}
                  style={styles.stopButtonGradient}
                >
                  <Text style={styles.stopButtonText}>End Prayer Walk</Text>
                  <FontAwesome5 name="stop-circle" size={18} color="#fff" style={styles.stopButtonIcon} />
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };  // Render history/admin screen
  const renderHistoryScreen = () => {
    const dataToShow = currentUser?.isAdmin ? walkData : userWalks;
    const title = currentUser?.isAdmin ? "All Prayer Walks" : "My Prayer Walks";  // Optimized function to get bounds for all paths (for admin unified map)
  const getUnifiedMapBounds = useCallback(() => {
    if (!currentUser?.isAdmin || walkData.length === 0) return null;
    
    // Use sampling for very large datasets to improve performance
    const shouldSample = walkData.reduce((total, walk) => total + walk.path.length, 0) > 1000;
    
    // Extract coordinates using a sampling approach for better performance
    const allCoordinates = walkData.reduce((acc, walk) => {
      if (!walk.path || walk.path.length === 0) return acc;
      
      if (shouldSample) {
        // For large datasets, sample points instead of using all
        const sampledPoints = [];
        const pathLen = walk.path.length;
        
        // Always include first and last point
        sampledPoints.push(walk.path[0]);
        
        // Sample some points in the middle based on path length
        const sampleCount = Math.min(20, Math.floor(pathLen / 10));
        if (sampleCount > 0) {
          for (let i = 1; i < sampleCount - 1; i++) {
            const idx = Math.floor((i / sampleCount) * pathLen);
            sampledPoints.push(walk.path[idx]);
          }
        }
        
        // Include the last point if path has multiple points
        if (pathLen > 1) {
          sampledPoints.push(walk.path[pathLen - 1]);
        }
        
        return [...acc, ...sampledPoints];
      }
      
      // For smaller datasets, include all points
      return [...acc, ...walk.path];
    }, []);
    
    if (allCoordinates.length === 0) return null;
    
    // Find min/max lat/lng
    const minLat = Math.min(...allCoordinates.map(c => c.latitude));
    const maxLat = Math.max(...allCoordinates.map(c => c.latitude));
    const minLng = Math.min(...allCoordinates.map(c => c.longitude));
    const maxLng = Math.max(...allCoordinates.map(c => c.longitude));
    
    // Add padding
    const latDelta = (maxLat - minLat) * 1.2 || 0.02;
    const lngDelta = (maxLng - minLng) * 1.2 || 0.02;
    
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(latDelta, 0.01),
      longitudeDelta: Math.max(lngDelta, 0.01),
    };
  }, [walkData, currentUser?.isAdmin]);  // Admin unified map view with performance optimizations
  const renderAdminUnifiedMap = () => {
    if (!currentUser?.isAdmin || walkData.length === 0) return null;
    
    const mapRegion = getUnifiedMapBounds();
    if (!mapRegion) return null;
    
    // Prepare marker data for clustering
    const pathMarkers = useMemo(() => {
      return walkData.flatMap(walk => {
        // For clustering, sample points from each path
        // Take the first, last, and some points in between
        const path = walk.path;
        if (!path || path.length === 0) return [];
        
        const markers = [];
        markers.push({ coordinate: path[0], walkId: walk.id });
        
        if (path.length > 20) {
          // Add some sampling points for longer paths
          markers.push({ coordinate: path[Math.floor(path.length * 0.33)], walkId: walk.id });
          markers.push({ coordinate: path[Math.floor(path.length * 0.66)], walkId: walk.id });
        }
        
        if (path.length > 1) {
          markers.push({ coordinate: path[path.length - 1], walkId: walk.id });
        }
        
        return markers;
      });
    }, [walkData]);
    
    return (
      <View style={styles.adminUnifiedMapContainer}>
        <View style={styles.adminUnifiedMapHeader}>
          <Text style={styles.adminUnifiedMapTitle}>Prayer Walk Coverage</Text>
          <Text style={styles.adminUnifiedMapSubtitle}>All tracked prayer paths</Text>
        </View>
        
        {Platform.OS !== 'web' ? (
          <View style={styles.adminUnifiedMapWrapper}>
            <MapComponent
              style={styles.adminUnifiedMap}
              initialRegion={mapRegion}
              scrollEnabled={true}
              zoomEnabled={true}
              pitchEnabled={false}
              rotateEnabled={true}
              maxZoomLevel={16} // Limit max zoom for better performance
              minZoomLevel={9} // Ensure minimum zoom level for overview
              onMapReady={() => console.log('Admin unified map loaded')}
            >
              {walkData.map((walk, index) => (
                <MapPolyline
                  key={`path-${walk.id}`}
                  coordinates={walk.path}
                  strokeColor={KHARIS_YELLOW}
                  strokeWidth={3}
                  // Apply more aggressive simplification for overview map
                  simplifyTolerance={0.0005}
                />
              ))}
              
              {/* Add clustered markers */}
              <MapMarkerCluster 
                markers={pathMarkers}
                region={mapRegion}
              />
            </MapComponent>
            
            <View style={styles.adminUnifiedMapOverlay}>
              <View style={styles.adminUnifiedMapLegend}>
                <View style={styles.adminUnifiedMapLegendItem}>
                  <View style={styles.adminUnifiedMapLegendLine} />
                  <Text style={styles.adminUnifiedMapLegendText}>Prayer Paths</Text>
                </View>
              </View>
            </View>
          </View>
          ) : (
            <View style={styles.adminUnifiedWebMap}>
              <View style={styles.adminUnifiedWebMapContent}>
                <FontAwesome5 name="map-marked-alt" size={40} color={KHARIS_YELLOW} />
                <Text style={styles.adminUnifiedWebMapTitle}>Combined Prayer Coverage</Text>
                <Text style={styles.adminUnifiedWebMapText}>
                  This map shows all {walkData.length} prayer walks combined, covering approximately {adminStats.totalDistance} km.
                </Text>
                <Text style={styles.adminUnifiedWebMapNote}>
                  Full interactive map available on mobile devices.
                </Text>
              </View>
            </View>
          )}
        </View>
      );
    };
    
    return (
      <View style={styles.historyContainer}>
        <ScrollView>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="map-marker-path" size={24} color={KHARIS_YELLOW} />
              <Text style={styles.statValue}>{adminStats.totalWalks}</Text>
              <Text style={styles.statLabel}>
                {currentUser?.isAdmin ? "Total Walks" : "My Walks"}
              </Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="map-marker-distance" size={24} color={KHARIS_YELLOW} />
              <Text style={styles.statValue}>{adminStats.totalDistance} km</Text>
              <Text style={styles.statLabel}>Distance Covered</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="time-outline" size={24} color={KHARIS_YELLOW} />
              <Text style={styles.statValue}>{adminStats.avgTime}</Text>
              <Text style={styles.statLabel}>Avg Walk Time</Text>
            </View>
          </View>
          
          {/* Admin unified map (only for admin users) */}
          {currentUser?.isAdmin && renderAdminUnifiedMap()}
          
          <View style={styles.recentActivityHeader}>
            <Text style={styles.recentActivityTitle}>{title}</Text>
          </View>
          
          {dataToShow.length === 0 ? (
            <View style={styles.emptyState}>
              <FontAwesome5 name="praying-hands" size={50} color={KHARIS_YELLOW_LIGHT} />
              <Text style={styles.emptyStateTitle}>No Prayer Walks Yet</Text>
              <Text style={styles.emptyStateText}>
                {currentUser?.isAdmin 
                  ? "No prayer walks have been recorded yet." 
                  : "Start tracking your first prayer walk to see your history here."}
              </Text>
            </View>
          ) : (
            <View style={styles.historyListContainer}>
              {dataToShow.map((walk) => (
                <View key={walk.id} style={styles.walkHistoryItem}>
                  <View style={styles.walkHistoryTop}>
                    <View style={styles.walkHistoryUser}>
                      <View style={styles.walkHistoryAvatar}>                        <Text style={styles.walkHistoryAvatarText}>
                          {(walk.user_name || walk.user_email).charAt(0)}
                        </Text>
                      </View>
                      <Text style={styles.walkHistoryName}>{walk.user_name || walk.user_email}</Text>
                    </View>
                    <Text style={styles.walkHistoryDate}>{walk.date}</Text>
                  </View>          {Platform.OS !== 'web' ? (
            <View style={styles.walkHistoryMap}>
              <MapComponent
                style={styles.walkHistoryMapView}
                scrollEnabled={false}
                zoomEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
                initialRegion={{
                  latitude: walk.path[0]?.latitude || 37.78825,
                  longitude: walk.path[0]?.longitude || -122.4324,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                maxZoomLevel={16} // Limit max zoom for better performance
                minZoomLevel={10} // Ensure minimum zoom level for overview
              >
                {/* Use optimized polyline component */}
                <MapPolyline
                  coordinates={walk.path}
                  strokeColor={KHARIS_YELLOW}
                  strokeWidth={3}
                />
              </MapComponent>
            </View>
                  ) : (
                    <View style={styles.walkHistoryWebMap}>
                      <FontAwesome5 name="route" size={24} color={KHARIS_YELLOW} />
                      <Text style={styles.walkHistoryWebMapText}>
                        Prayer route with {walk.path.length} tracked points
                      </Text>
                    </View>
                  )}
                  
                  <View style={styles.walkHistoryStats}>
                    <View style={styles.walkHistoryStat}>
                      <MaterialCommunityIcons name="map-marker-distance" size={16} color={KHARIS_YELLOW_DARK} />
                      <Text style={styles.walkHistoryStatText}>{walk.distance} km</Text>
                    </View>
                    <View style={styles.walkHistoryStat}>
                      <Ionicons name="time-outline" size={16} color={KHARIS_YELLOW_DARK} />
                      <Text style={styles.walkHistoryStatText}>{walk.time}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    );
  };
  
  // Render profile screen
  const renderProfileScreen = () => {
    return (
      <View style={styles.profileContainer}>
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatarContainer}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>
                {currentUser?.name.charAt(0) || "U"}
              </Text>
            </View>
          </View>
          
          <Text style={styles.profileName}>{currentUser?.name || "User"}</Text>
          <Text style={styles.profileUsername}>@{currentUser?.username || "username"}</Text>
          
          {currentUser?.isAdmin && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>Admin</Text>
            </View>
          )}
        </View>
        
        <View style={styles.profileStatsContainer}>
          <View style={styles.profileStatCard}>
            <Text style={styles.profileStatValue}>{userWalks.length}</Text>
            <Text style={styles.profileStatLabel}>Walks</Text>
          </View>
          <View style={styles.profileStatCard}>
            <Text style={styles.profileStatValue}>
              {userWalks.reduce((sum, walk) => sum + walk.distance, 0).toFixed(1)} km
            </Text>
            <Text style={styles.profileStatLabel}>Distance</Text>
          </View>
        </View>
        
        <View style={styles.profileActions}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <AntDesign name="logout" size={18} color={KHARIS_DARK} style={styles.logoutIcon} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.appInfoContainer}>          <LogoSvg
            style={styles.appInfoLogo}
            width={40}
            height={40}
          />
          <Text style={styles.appInfoVersion}>Kharis Prayer Walk v1.0.0</Text>
          <Text style={styles.appInfoCopyright}>© 2025 Kharis Ministries</Text>
        </View>
      </View>
    );
  };  // Main render
  if (isLoading) {
    return renderSplashScreen();
  }
  
  if (!isAuthenticated) {
    return renderAuthScreen();
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>          <LogoSvg
            style={styles.headerLogo}
            width={28}
            height={28}
          />
        <Text style={styles.headerTitle}>Kharis Prayer Walk</Text>
      </View>
      
      {tab === 'track' ? renderTrackScreen() : 
       tab === 'history' ? renderHistoryScreen() : 
       renderProfileScreen()}
      
      <View style={styles.tabBar}>
        {/* Only show track tab for non-admin users */}
        {!currentUser?.isAdmin && (
          <TouchableOpacity
            style={[styles.tab, tab === 'track' && styles.activeTab]}
            onPress={() => setTab('track')}
          >
            <FontAwesome5 
              name="map-marked-alt" 
              size={20} 
              color={tab === 'track' ? KHARIS_YELLOW : '#888'} 
            />
            <Text style={[styles.tabText, tab === 'track' && styles.activeTabText]}>
              Track
            </Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.tab, tab === 'history' && styles.activeTab, currentUser?.isAdmin && {flex: 1.5}]}
          onPress={() => setTab('history')}
        >
          <FontAwesome5 
            name="history" 
            size={20} 
            color={tab === 'history' ? KHARIS_YELLOW : '#888'} 
          />
          <Text style={[styles.tabText, tab === 'history' && styles.activeTabText]}>
            {currentUser?.isAdmin ? "Admin" : "History"}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, tab === 'profile' && styles.activeTab, currentUser?.isAdmin && {flex: 1.5}]}
          onPress={() => setTab('profile')}
        >
          <FontAwesome5 
            name="user" 
            size={20} 
            color={tab === 'profile' ? KHARIS_YELLOW : '#888'} 
          />
          <Text style={[styles.tabText, tab === 'profile' && styles.activeTabText]}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

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
  walkHistoryWebMap: {
    height: 100,
    backgroundColor: '#f5f5f7',
    borderRadius: 8,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  walkHistoryWebMapText: {
    fontSize: 14,
    color: KHARIS_GRAY,
    marginTop: 8,
  },
  
  // Admin unified map styles
  adminUnifiedMapContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 16,
    marginTop: 0,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adminUnifiedMapHeader: {
    marginBottom: 12,
  },
  adminUnifiedMapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: KHARIS_DARK,
  },
  adminUnifiedMapSubtitle: {
    fontSize: 14,
    color: KHARIS_GRAY,
    marginTop: 4,
  },
  adminUnifiedMapWrapper: {
    height: 250,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  adminUnifiedMap: {
    ...StyleSheet.absoluteFillObject,
  },
  adminUnifiedMapOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 8,
  },
  adminUnifiedMapLegend: {
    flexDirection: 'column',
  },
  adminUnifiedMapLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  adminUnifiedMapLegendLine: {
    width: 20,
    height: 3,
    backgroundColor: KHARIS_YELLOW,
    marginRight: 8,
  },
  adminUnifiedMapLegendText: {
    fontSize: 12,
    color: KHARIS_DARK,
  },
  adminUnifiedWebMap: {
    height: 200,
    backgroundColor: '#f5f5f7',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  adminUnifiedWebMapContent: {
    alignItems: 'center',
  },
  adminUnifiedWebMapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: KHARIS_DARK,
    marginTop: 12,
    marginBottom: 8,
  },
  adminUnifiedWebMapText: {
    fontSize: 14,
    color: KHARIS_GRAY,
    textAlign: 'center',
    marginBottom: 8,
  },
  adminUnifiedWebMapNote: {
    fontSize: 12,
    color: KHARIS_GRAY,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  // Main container
  container: {
    flex: 1,
    backgroundColor: KHARIS_LIGHT,
  },
  
  // Splash screen styles
  splashContainer: {
    flex: 1,
    backgroundColor: KHARIS_YELLOW,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashLogoContainer: {
    alignItems: 'center',
  },
  splashLogo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  splashText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },  // Auth screen styles
  authContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  authScrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  authLogoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 30,
  },
  authLogo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  authTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: KHARIS_DARK,
    marginBottom: 4,
  },
  authSubtitle: {
    fontSize: 18,
    color: KHARIS_GRAY,
  },
  authTabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    marginBottom: 20,
  },
  authTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  authActiveTab: {
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  authTabText: {
    fontSize: 16,
    color: KHARIS_GRAY,
  },
  authActiveTabText: {
    color: KHARIS_DARK,
    fontWeight: 'bold',
  },
  authFormContainer: {
    paddingHorizontal: 20,
  },
  authFormTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: KHARIS_DARK,
    marginBottom: 8,
  },
  authFormSubtitle: {
    fontSize: 16,
    color: KHARIS_GRAY,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 55,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: KHARIS_DARK,
  },
  adminSwitchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  adminSwitchLabel: {
    fontSize: 16,
    color: KHARIS_DARK,
  },
  authButton: {
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  authButtonGradient: {
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupTermsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  signupTermsText: {
    flex: 1,
    fontSize: 14,
    color: KHARIS_GRAY,
    lineHeight: 20,
  },
  authFooter: {
    marginTop: 20,
    alignItems: 'center',
  },
  authFooterText: {
    fontSize: 14,
    color: KHARIS_GRAY,
    marginBottom: 4,
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLogo: {
    width: 28,
    height: 28,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  
  // Tab bar styles
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    height: 60,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: {
    borderTopWidth: 3,
    borderTopColor: KHARIS_YELLOW,
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
    color: '#888',
  },
  activeTabText: {
    color: KHARIS_YELLOW,
    fontWeight: '600',
  },
  
  // Loading screen styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
  },
  
  // Permission request screen styles
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#555',
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: KHARIS_YELLOW,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Track screen styles
  trackContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  customMarker: {
    backgroundColor: KHARIS_YELLOW,
    borderRadius: 15,
    padding: 8,
    borderWidth: 3,
    borderColor: '#fff',
  },
  statsOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsItem: {
    alignItems: 'center',
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statsLabel: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  trackActionsContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  startButton: {
    width: 220,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  startButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  startButtonIcon: {
    marginLeft: 8,
  },
  stopButton: {
    width: 220,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  stopButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stopButtonIcon: {
    marginLeft: 8,
  },
  
  // Summary screen styles
  summaryOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  summaryActions: {
    marginTop: 10,
  },
  summaryButton: {
    borderRadius: 8,
    paddingVertical: 12,
    marginVertical: 6,
    alignItems: 'center',
  },
  summaryPrimaryButton: {
    backgroundColor: KHARIS_YELLOW,
  },
  summaryPrimaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  summarySecondaryButton: {
    backgroundColor: '#f5f5f5',
  },
  summarySecondaryButtonText: {
    color: '#555',
    fontSize: 16,
  },
  
  // History screen styles
  historyContainer: {
    flex: 1,
    backgroundColor: KHARIS_LIGHT,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '31%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
    textAlign: 'center',
  },
  recentActivityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  recentActivityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  historyListContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  walkHistoryItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  walkHistoryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  walkHistoryUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walkHistoryAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: KHARIS_YELLOW_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  walkHistoryAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  walkHistoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  walkHistoryDate: {
    fontSize: 14,
    color: '#777',
  },
  walkHistoryMap: {
    height: 150,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  walkHistoryMapView: {
    ...StyleSheet.absoluteFillObject,
  },
  walkHistoryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  walkHistoryStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walkHistoryStatText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#555',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: KHARIS_DARK,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: KHARIS_GRAY,
    textAlign: 'center',
    marginBottom: 20,
  },
  
  // Profile screen styles
  profileContainer: {
    flex: 1,
    backgroundColor: KHARIS_LIGHT,
    padding: 16,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileAvatarContainer: {
    marginBottom: 16,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: KHARIS_YELLOW,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: KHARIS_DARK,
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: 16,
    color: KHARIS_GRAY,
    marginBottom: 8,
  },
  adminBadge: {
    backgroundColor: KHARIS_YELLOW_LIGHT,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  adminBadgeText: {
    color: KHARIS_DARK,
    fontWeight: 'bold',
    fontSize: 14,
  },
  profileStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileStatCard: {
    alignItems: 'center',
  },
  profileStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: KHARIS_DARK,
  },
  profileStatLabel: {
    fontSize: 14,
    color: KHARIS_GRAY,
    marginTop: 4,
  },
  profileActions: {
    marginBottom: 40,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: KHARIS_DARK,
  },
  appInfoContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
  },
  appInfoLogo: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  appInfoVersion: {
    fontSize: 14,
    color: KHARIS_GRAY,
    marginBottom: 4,
  },
  appInfoCopyright: {
    fontSize: 12,
    color: KHARIS_GRAY,
  },
  consentNoteText: {
    flex: 1,
    fontSize: 14,
    color: KHARIS_GRAY,
  },
  consentSwitchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  consentSwitchLabel: {
    fontSize: 14,
    color: KHARIS_DARK,
  },
});