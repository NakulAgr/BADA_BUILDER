// src/pages/BookSiteVisit.jsx
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import emailjs from '@emailjs/browser';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, Clock, Users, MapPin, CreditCard, Car, Loader2, Check, ArrowLeft, RotateCcw, X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import { Loader } from '@googlemaps/js-api-loader';
import "react-datepicker/dist/react-datepicker.css";

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Generate time slots in 30-minute intervals
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 10; hour <= 17; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      if (hour === 17 && minute > 0) break; // Stop at 5:00 PM
      const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const time12 = `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
      slots.push({ value: time24, label: time12 });
    }
  }
  return slots;
};

const timeSlots = generateTimeSlots();

const BookSiteVisit = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const property = location.state?.property;

  const [formData, setFormData] = useState({
    date: null,
    time: '',
    people: '1',
    person1: '',
    person2: '',
    person3: '',
    paymentMethod: 'postvisit',
    address: '',
    coordinates: null
  });

  const [loading, setLoading] = useState(false);
  const [bookingStep, setBookingStep] = useState('');
  const [error, setError] = useState('');
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  
  // Refs for Google Maps
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderRef = useRef(null);

  // Google Maps API loaded state
  const [mapsApiLoaded, setMapsApiLoaded] = useState(false);

  // Initialize Google Maps API
  useEffect(() => {
    const initializeGoogleMapsAPI = async () => {
      console.log('Starting Google Maps API initialization...');
      try {
        // Check if Google Maps is already loaded
        if (window.google && window.google.maps) {
          console.log('Google Maps API already loaded');
          setMapsApiLoaded(true);
          return;
        }

        const loader = new Loader({
          apiKey: "AIzaSyAruIz1wMmd6JXT3DAWVRym7N3vxPWo94A", // Replace with your actual API key
          version: "weekly",
          libraries: ["places", "geometry"]
        });
        
        console.log('Loading Google Maps API...');
        await loader.load();
        setMapsApiLoaded(true);
        // Clear any existing errors when API loads successfully
        setError('');
        console.log('✅ Google Maps API loaded successfully');
      } catch (error) {
        console.error('❌ Error loading Google Maps API:', error);
        setMapsApiLoaded(false);
        setError('Google Maps failed to load. Please enter your address manually.');
        // Set a fallback after 5 seconds to allow manual address entry
        setTimeout(() => {
          console.log('Setting fallback state for manual address entry');
          setMapsApiLoaded(true);
        }, 5000);
      }
    };

    // Only initialize once on component mount
    initializeGoogleMapsAPI();
  }, []); // Empty dependency array

  const isSunday = (date) => date.getDay() === 0;
  
  const isTimeDisabled = (time) => {
    if (!formData.date) return false;
    
    const selectedDate = new Date(formData.date);
    const today = new Date();
    
    // If selected date is today, disable past times
    if (selectedDate.toDateString() === today.toDateString()) {
      const [hours, minutes] = time.split(':').map(Number);
      const timeDate = new Date();
      timeDate.setHours(hours, minutes, 0, 0);
      return timeDate <= today;
    }
    
    return false;
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleDateChange = (date) => {
    if (date && isSunday(date)) {
      setError('Site visits are not available on Sundays. Please select another date.');
      return;
    }
    setFormData(prev => ({ ...prev, date, time: '' })); // Reset time when date changes
    setError('');
  };

  // EmailJS function to send admin notification
  const sendAdminEmail = async (bookingData) => {
    try {
      // Create visitor list with all names
      const visitors = [];
      if (bookingData.person1_name) visitors.push(`1. ${bookingData.person1_name}`);
      if (bookingData.person2_name) visitors.push(`2. ${bookingData.person2_name}`);
      if (bookingData.person3_name) visitors.push(`3. ${bookingData.person3_name}`);
      const allVisitors = visitors.join('\n');

      const templateParams = {
        person1: bookingData.person1_name,
        all_visitors: allVisitors,
        number_of_people: bookingData.number_of_people,
        user_email: bookingData.user_email,
        visit_date: bookingData.visit_date,
        visit_time: bookingData.visit_time,
        pickup_address: bookingData.pickup_address,
        property_title: bookingData.property_title,
        payment_method: bookingData.payment_method
      };

      const result = await emailjs.send(
        'service_d188p7h',    // Your service ID
        'template_h5bldc9',   // Your template ID
        templateParams,
        'X1M-x2azpHtpYjDJb'   // Your public key
      );

      console.log('✅ Admin email sent successfully:', result.text);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to send admin email:', error);
      return { success: false, error: error.text };
    }
  };

  // Initialize Google Map in modal
  const initializeMap = async () => {
    // Check if API is loaded and DOM element exists
    if (!mapsApiLoaded || !mapRef.current || !window.google) {
      console.log('Maps API not ready:', { mapsApiLoaded, mapRef: !!mapRef.current, google: !!window.google });
      return;
    }

    try {
      setMapLoading(true);
      
      // Wait a bit more for DOM to be fully ready
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Ensure the map container has dimensions
      const mapContainer = mapRef.current;
      if (mapContainer.offsetWidth === 0 || mapContainer.offsetHeight === 0) {
        console.error('Map container has no dimensions');
        setMapLoading(false);
        return;
      }
      
      // Default location (Delhi, India)
      const defaultLocation = { lat: 28.6139, lng: 77.2090 };
      
      // Initialize map with proper options
      const map = new window.google.maps.Map(mapContainer, {
        center: defaultLocation,
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        gestureHandling: 'cooperative',
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      // Initialize geocoder
      const geocoder = new window.google.maps.Geocoder();
      geocoderRef.current = geocoder;

      // Create draggable marker using AdvancedMarkerElement (new API)
      const marker = new window.google.maps.Marker({
        position: defaultLocation,
        map: map,
        draggable: true,
        title: 'Drag me to your pickup location',
        animation: window.google.maps.Animation.DROP
      });

      // Store references
      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Handle marker drag end
      marker.addListener('dragend', () => {
        const position = marker.getPosition();
        if (position) {
          reverseGeocode(position.lat(), position.lng());
        }
      });

      // Handle map click
      map.addListener('click', (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        marker.setPosition({ lat, lng });
        reverseGeocode(lat, lng);
      });

      // Try to get user's current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            map.setCenter(userLocation);
            marker.setPosition(userLocation);
            reverseGeocode(userLocation.lat, userLocation.lng);
          },
          (error) => {
            console.log('Geolocation error:', error);
            // Continue with default location
          },
          {
            timeout: 10000,
            enableHighAccuracy: true,
            maximumAge: 300000
          }
        );
      }

      // Trigger resize event to ensure proper rendering
      setTimeout(() => {
        window.google.maps.event.trigger(map, 'resize');
        map.setCenter(defaultLocation);
      }, 100);

      setMapLoading(false);
      console.log('Map initialized successfully');
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapLoading(false);
    }
  };

  // Reverse geocode coordinates to address
  const reverseGeocode = (lat, lng) => {
    if (!geocoderRef.current) return;

    geocoderRef.current.geocode(
      { location: { lat, lng } },
      (results, status) => {
        if (status === 'OK' && results[0]) {
          const address = results[0].formatted_address;
          setFormData(prev => ({ 
            ...prev, 
            address, 
            coordinates: { lat, lng } 
          }));
        }
      }
    );
  };

  // Open Google Maps modal
  const openMapModal = () => {
    console.log('Opening map modal. API loaded:', mapsApiLoaded);
    if (!mapsApiLoaded) {
      setError('Google Maps is still loading. Please try again in a moment.');
      return;
    }
    // Clear any existing errors when opening map
    setError('');
    setShowMapModal(true);
  };

  // Initialize map when modal opens and API is ready
  useEffect(() => {
    if (showMapModal && mapsApiLoaded) {
      // Wait for modal animation and DOM to be ready
      const timer = setTimeout(() => {
        initializeMap();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [showMapModal, mapsApiLoaded]);

  // Close map modal
  const closeMapModal = () => {
    setShowMapModal(false);
    // Clean up map instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current = null;
    }
    if (markerRef.current) {
      markerRef.current = null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent double submission
    if (loading) return;
    
    if (!isAuthenticated) {
      setError('Please login to book a site visit');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    setLoading(true);
    setBookingStep('Saving booking details...');
    setError('');

    try {
      const bookingData = {
        property_id: property?.id || 'unknown',
        property_title: property?.title || 'Unknown Property',
        user_id: currentUser.uid,
        user_email: currentUser.email,
        visit_date: formData.date ? formData.date.toISOString().split('T')[0] : '',
        visit_time: formData.time,
        number_of_people: parseInt(formData.people),
        person1_name: formData.person1,
        person2_name: formData.person2 || null,
        person3_name: formData.person3 || null,
        pickup_address: formData.address,
        pickup_coordinates: formData.coordinates,
        payment_method: formData.paymentMethod,
        created_at: new Date().toISOString(),
        status: 'pending'
      };

      // Save to Firestore with timeout
      const savePromise = addDoc(collection(db, 'bookings'), bookingData);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );

      const docRef = await Promise.race([savePromise, timeoutPromise]);
      
      // Add booking ID to data for notifications
      bookingData.booking_id = docRef.id;
      bookingData.property_location = property?.location || 'N/A';

      setBookingStep('Booking confirmed! Redirecting...');

      // Send notifications in background (non-blocking)
      Promise.allSettled([
        sendAdminEmail(bookingData),
        fetch('http://localhost:3002/api/notify-booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingData)
        }).then(res => res.json()).catch(() => ({ success: false }))
      ]).then(results => {
        console.log('Notification results:', results);
      });

      // Show success message and redirect automatically
      setBookingStep('Booking successful! Redirecting to home...');
      
      // Automatic redirect without user interaction
      setTimeout(() => {
        navigate('/', { 
          state: { 
            successMessage: 'Your site visit has been booked successfully! You will receive a confirmation shortly.' 
          }
        });
      }, 2000);

    } catch (error) {
      console.error('Error booking site visit:', error);
      setLoading(false);
      
      if (error.message === 'Request timeout') {
        setError('Request timed out. Please check your connection and try again.');
      } else {
        setError('Failed to book site visit. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button variant="ghost" onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book a Site Visit</h1>
          {property && (
            <p className="text-gray-500">
              Property: <span className="text-gray-900 font-medium">{property.title}</span>
            </p>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Date & Time */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-gray-900 mb-2">
                    <CalendarDays className="w-5 h-5 text-gray-700" />
                    <h3 className="font-semibold">Select Date & Time</h3>
                  </div>
                  <div className="date-time-grid">
                    {/* Date Picker */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">Visit Date</label>
                      <div className="relative date-picker-container">
                        <div className="date-select-wrapper form-input-height bg-gray-50 border border-gray-200 rounded-lg w-full cursor-pointer flex items-center gap-3 px-3">
                          <CalendarDays className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <DatePicker
                            selected={formData.date}
                            onChange={handleDateChange}
                            minDate={new Date()}
                            maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
                            filterDate={(date) => !isSunday(date)}
                            dateFormat="dd MMM yyyy"
                            placeholderText="Select visit date"
                            wrapperClassName="flex-1"
                            className="date-picker-input w-full bg-transparent border-none outline-none text-sm cursor-pointer"
                            calendarClassName="shadow-lg border border-gray-200 rounded-lg"
                            showTimeSelect={false}
                            showTimeInput={false}
                            showTimeSelectOnly={false}
                            required
                          />
                          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Monday to Saturday only</p>
                    </div>

                    {/* Time Picker */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">Visit Time</label>
                      <div className="relative time-picker-container">
                        <Select 
                          value={formData.time} 
                          onValueChange={(value) => handleChange('time', value)}
                          disabled={!formData.date}
                        >
                          <SelectTrigger className="time-select-trigger form-input-height bg-gray-50 border-gray-200 w-full cursor-pointer flex items-center gap-3 px-3">
                            <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <SelectValue placeholder="Select time slot" className="flex-1 text-left" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-gray-200 max-h-60 overflow-y-auto">
                            {timeSlots.map(slot => (
                              <SelectItem 
                                key={slot.value} 
                                value={slot.value}
                                disabled={isTimeDisabled(slot.value)}
                                className={isTimeDisabled(slot.value) ? 'opacity-50 cursor-not-allowed' : ''}
                              >
                                {slot.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">10:00 AM - 5:00 PM (30 min slots)</p>
                    </div>
                  </div>
                </div>

                {/* Visitors */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-gray-900 mb-2">
                    <Users className="w-5 h-5 text-gray-700" />
                    <h3 className="font-semibold">Visitor Details</h3>
                  </div>
                  <Select value={formData.people} onValueChange={(value) => handleChange('people', value)}>
                    <SelectTrigger className="bg-gray-50 border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="1">1 Person</SelectItem>
                      <SelectItem value="2">2 People</SelectItem>
                      <SelectItem value="3">3 People</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="space-y-3">
                    <Input
                      placeholder="1st Person Name *"
                      value={formData.person1}
                      onChange={(e) => handleChange('person1', e.target.value)}
                      required
                      className="bg-gray-50 border-gray-200"
                    />
                    <AnimatePresence>
                      {parseInt(formData.people) >= 2 && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                          <Input
                            placeholder="2nd Person Name *"
                            value={formData.person2}
                            onChange={(e) => handleChange('person2', e.target.value)}
                            required={parseInt(formData.people) >= 2}
                            className="bg-gray-50 border-gray-200"
                          />
                        </motion.div>
                      )}
                      {parseInt(formData.people) >= 3 && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                          <Input
                            placeholder="3rd Person Name *"
                            value={formData.person3}
                            onChange={(e) => handleChange('person3', e.target.value)}
                            required
                            className="bg-gray-50 border-gray-200"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Pickup Location */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-gray-900 mb-2">
                    <MapPin className="w-5 h-5 text-gray-700" />
                    <h3 className="font-semibold">Pickup Location</h3>
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                    <Input
                      placeholder="Click map button to select location..."
                      value={formData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      required
                      className="pl-10 pr-12 bg-gray-50 border-gray-200"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={openMapModal}
                      disabled={loading || !mapsApiLoaded}
                      className={`absolute right-2 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-lg text-sm transition-colors flex items-center gap-1 ${
                        mapsApiLoaded 
                          ? 'bg-blue-500 hover:bg-blue-600 cursor-pointer' 
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                      title={mapsApiLoaded ? "Select location on map" : "Loading Google Maps..."}
                    >
                      {mapsApiLoaded ? (
                        <>
                          <MapPin className="w-4 h-4" />
                          Map
                        </>
                      ) : (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Loading
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">Click the map button to pin your exact pickup location</p>
                </div>

                {/* Payment Method */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-gray-900 mb-2">
                    <CreditCard className="w-5 h-5 text-gray-700" />
                    <h3 className="font-semibold">Payment Method</h3>
                  </div>
                  <div className="flex gap-4">
                    <label className={cn(
                      "flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-all",
                      formData.paymentMethod === 'previsit' 
                        ? "border-gray-900 bg-gray-50" 
                        : "border-gray-200 hover:border-gray-300"
                    )}>
                      <input
                        type="radio"
                        value="previsit"
                        checked={formData.paymentMethod === 'previsit'}
                        onChange={(e) => handleChange('paymentMethod', e.target.value)}
                        className="sr-only"
                      />
                      <Check className={cn("w-4 h-4", formData.paymentMethod === 'previsit' ? "opacity-100 text-gray-900" : "opacity-0")} />
                      <span className="text-gray-700">Previsit</span>
                    </label>
                    <label className={cn(
                      "flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-all",
                      formData.paymentMethod === 'postvisit' 
                        ? "border-gray-900 bg-gray-50" 
                        : "border-gray-200 hover:border-gray-300"
                    )}>
                      <input
                        type="radio"
                        value="postvisit"
                        checked={formData.paymentMethod === 'postvisit'}
                        onChange={(e) => handleChange('paymentMethod', e.target.value)}
                        className="sr-only"
                      />
                      <Check className={cn("w-4 h-4", formData.paymentMethod === 'postvisit' ? "opacity-100 text-gray-900" : "opacity-0")} />
                      <span className="text-gray-700">Postvisit</span>
                    </label>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 gap-2 bg-gray-900 text-white hover:bg-gray-800"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    {loading ? 'Booking...' : 'Book Visit'}
                  </Button>
                  <Button type="button" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50" disabled={loading}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reschedule
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700" disabled={loading}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>

          {/* Info Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <Car className="w-5 h-5 text-gray-700" />
                <h3 className="font-semibold text-gray-900">Visit Information</h3>
              </div>
              
              <div className="space-y-4 text-sm">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-medium text-gray-900 mb-1">Visit Duration & Charges</p>
                  <p className="text-3xl font-bold text-gray-900">₹300 <span className="text-sm font-normal text-gray-500">/ hour</span></p>
                  <p className="text-gray-500 text-xs mt-1">Additional: ₹5 per minute</p>
                </div>

                <div className="text-gray-600 space-y-3">
                  <p className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    A car will pick you up from your address
                  </p>
                  <p className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    Visit the property with our expert
                  </p>
                  <p className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    Drop back at your address
                  </p>
                </div>

                <Badge className="bg-green-100 text-green-700 border-green-200">
                  Purchase refund: Visit charges refunded if you buy!
                </Badge>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Loading/Success Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center max-w-md">
            {bookingStep.includes('successful') || bookingStep.includes('Redirecting') ? (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Booking Successful!</h3>
                <p className="text-gray-600">{bookingStep}</p>
              </>
            ) : (
              <>
                <Loader2 className="w-8 h-8 animate-spin text-gray-900 mx-auto mb-4" />
                <p className="text-gray-700">{bookingStep}</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Google Maps Modal */}
      <AnimatePresence>
        {showMapModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeMapModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Select Pickup Location</h3>
                  <p className="text-sm text-gray-500 mt-1">Click on the map or drag the marker to set your pickup location</p>
                </div>
                <button
                  onClick={closeMapModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Map Container */}
              <div className="flex-1 relative overflow-hidden">
                {(mapLoading || !mapsApiLoaded) && (
                  <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-600">
                        {!mapsApiLoaded ? 'Loading Google Maps API...' : 'Initializing map...'}
                      </p>
                    </div>
                  </div>
                )}
                <div
                  ref={mapRef}
                  className="google-map-container w-full h-full"
                  style={{ 
                    minHeight: '400px',
                    height: '100%',
                    width: '100%'
                  }}
                />
              </div>

              {/* Selected Address Display */}
              {formData.address && (
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Selected Location:</p>
                      <p className="text-sm text-gray-600 mt-1">{formData.address}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={closeMapModal}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={closeMapModal}
                  disabled={!formData.address}
                  className="bg-gray-900 text-white hover:bg-gray-800"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Confirm Location
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookSiteVisit;