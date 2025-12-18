// src/pages/BookSiteVisit.jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, Clock, Users, MapPin, CreditCard, Car, Loader2, Check, ArrowLeft, RotateCcw, X } from 'lucide-react';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const timeSlots = [
  { value: '10:00', label: '10:00 AM' },
  { value: '10:30', label: '10:30 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '11:30', label: '11:30 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '12:30', label: '12:30 PM' },
  { value: '13:00', label: '1:00 PM' },
  { value: '13:30', label: '1:30 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '14:30', label: '2:30 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '15:30', label: '3:30 PM' },
  { value: '16:00', label: '4:00 PM' },
  { value: '16:30', label: '4:30 PM' },
  { value: '17:00', label: '5:00 PM' }
];

const BookSiteVisit = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const property = location.state?.property;

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    people: '1',
    person1: '',
    person2: '',
    person3: '',
    paymentMethod: 'postvisit',
    address: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [minDate, setMinDate] = useState('');
  const [maxDate, setMaxDate] = useState('');

  useEffect(() => {
    const today = new Date();
    const maxBookingDate = new Date();
    maxBookingDate.setDate(today.getDate() + 30);
    setMinDate(today.toISOString().split('T')[0]);
    setMaxDate(maxBookingDate.toISOString().split('T')[0]);
  }, []);

  const isSunday = (dateString) => new Date(dateString).getDay() === 0;

  const handleChange = (name, value) => {
    if (name === 'date' && isSunday(value)) {
      setError('Site visits are not available on Sundays. Please select another date.');
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Please login to book a site visit');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const bookingData = {
        property_id: property?.id || 'unknown',
        property_title: property?.title || 'Unknown Property',
        user_id: currentUser.uid,
        user_email: currentUser.email,
        visit_date: formData.date,
        visit_time: formData.time,
        number_of_people: parseInt(formData.people),
        person1_name: formData.person1,
        person2_name: formData.person2 || null,
        person3_name: formData.person3 || null,
        pickup_address: formData.address,
        payment_method: formData.paymentMethod,
        created_at: new Date().toISOString(),
        status: 'pending'
      };

      await addDoc(collection(db, 'bookings'), bookingData);

      try {
        await fetch('http://localhost:3002/api/notify-booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingData)
        });
      } catch (err) {
        console.warn('⚠️ Notification service unreachable');
      }

      navigate('/');
    } catch (error) {
      console.error('Error booking site visit:', error);
      setError('Failed to book site visit. Please try again.');
    } finally {
      setLoading(false);
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-gray-600">Visit Date</label>
                      <Input
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleChange('date', e.target.value)}
                        min={minDate}
                        max={maxDate}
                        required
                        className="bg-gray-50 border-gray-200"
                      />
                      <p className="text-xs text-gray-500">Monday to Saturday only</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-600">Visit Time</label>
                      <Select value={formData.time} onValueChange={(value) => handleChange('time', value)}>
                        <SelectTrigger className="bg-gray-50 border-gray-200">
                          <SelectValue placeholder="Select time slot" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                          {timeSlots.map(slot => (
                            <SelectItem key={slot.value} value={slot.value}>{slot.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">10:00 AM - 5:00 PM</p>
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
                  <Input
                    placeholder="Enter your complete pickup address..."
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    required
                    className="bg-gray-50 border-gray-200"
                  />
                  <p className="text-xs text-gray-500">Include area, city, and pincode</p>
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
                  <Button type="button" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reschedule
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
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
    </div>
  );
};

export default BookSiteVisit;