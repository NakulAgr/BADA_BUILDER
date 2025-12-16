// src/pages/BookSiteVisit.jsx
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './BookSiteVisit.css';

const BookSiteVisit = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const property = location.state?.property;

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    people: 1,
    person1: '',
    person2: '',
    person3: '',
    paymentMethod: 'postvisit',
  });

  const [locationData, setLocationData] = useState({
    address: ''
  });

  const [loading, setLoading] = useState(false);
  const [minDate, setMinDate] = useState('');
  const [maxDate, setMaxDate] = useState('');


  // Set date restrictions (today to 30 days from now, excluding Sundays)
  useEffect(() => {
    const today = new Date();
    const maxBookingDate = new Date();
    maxBookingDate.setDate(today.getDate() + 30);

    setMinDate(today.toISOString().split('T')[0]);
    setMaxDate(maxBookingDate.toISOString().split('T')[0]);
  }, []);





  // Check if selected date is a Sunday
  const isSunday = (dateString) => {
    const date = new Date(dateString);
    return date.getDay() === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Check if selected date is Sunday
    if (name === 'date' && isSunday(value)) {
      alert('Site visits are not available on Sundays. Please select another date.');
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handlePaymentMethodChange = (e) => {
    setFormData({ ...formData, paymentMethod: e.target.value });
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      alert('Please login to book a site visit');
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      // Save booking to Firestore
      const bookingData = {
        property_id: property?.id || 'unknown',
        property_title: property?.title || 'Unknown Property',
        user_id: currentUser.uid,
        user_email: currentUser.email,
        visit_date: formData.date,
        visit_time: formData.time,
        number_of_people: formData.people,
        person1_name: formData.person1,
        person2_name: formData.person2 || null,
        person3_name: formData.person3 || null,
        pickup_address: locationData.address,
        payment_method: formData.paymentMethod,
        created_at: new Date().toISOString(),
        status: 'pending'
      };

      const docRef = await addDoc(collection(db, 'bookings'), bookingData);

      // Add booking ID to data
      bookingData.booking_id = docRef.id;
      bookingData.property_location = property?.location || 'N/A';

      // Send email and WhatsApp notifications to admin

      try {
  const response = await fetch('http://localhost:3002/api/notify-booking', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingData)
  });

  const result = await response.json();

  if (result.success) {
    console.log('✅ Notifications sent successfully');
  } else {
    console.warn('⚠️ Notification failed:', result.error);
  }
} catch (err) {
  console.warn('⚠️ Notification service unreachable');
}

      alert('Your site visit has been booked successfully!\n\nYou will receive a confirmation shortly.');
      navigate('/');
    } catch (error) {
      console.error('Error booking site visit:', error);
      alert('Failed to book site visit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="book-visit-container">
      <div className="form-section ui-bg">
        <h2>Book a Site Visit</h2>
        <form onSubmit={handleSubmit}>
          <div className="date-time-section">
            <h4>📅 Select Date & Time</h4>
            <label>
              Visit Date:
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={minDate}
                max={maxDate}
                required
                className="enhanced-date-input"
              />
              <small className="date-help">Available Monday to Saturday (No Sundays)</small>
            </label>
            <label>
              Visit Time:
              <select name="time" value={formData.time} onChange={handleChange} required className="time-select">
                <option value="">Select time slot</option>
                <option value="10:00">10:00 AM</option>
                <option value="10:30">10:30 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="11:30">11:30 AM</option>
                <option value="12:00">12:00 PM</option>
                <option value="12:30">12:30 PM</option>
                <option value="13:00">1:00 PM</option>
                <option value="13:30">1:30 PM</option>
                <option value="14:00">2:00 PM</option>
                <option value="14:30">2:30 PM</option>
                <option value="15:00">3:00 PM</option>
                <option value="15:30">3:30 PM</option>
                <option value="16:00">4:00 PM</option>
                <option value="16:30">4:30 PM</option>
                <option value="17:00">5:00 PM</option>
              </select>
              <small className="time-help">Available slots: 10:00 AM - 5:00 PM</small>
            </label>
          </div>
          <label>
            Number of People (Max 3):
            <select name="people" value={formData.people} onChange={handleChange} required>
              <option value="1">1 Person</option>
              <option value="2">2 People</option>
              <option value="3">3 People</option>
            </select>
          </label>

          <div className="people-details">
            <h4>👥 Visitor Details</h4>
            <label>
              1st Person Name: *
              <input
                type="text"
                name="person1"
                value={formData.person1}
                onChange={handleChange}
                placeholder="Enter first person's name"
                required
              />
            </label>
            {formData.people >= 2 && (
              <label className="additional-person">
                2nd Person Name: {parseInt(formData.people) >= 2 ? '*' : ''}
                <input
                  type="text"
                  name="person2"
                  value={formData.person2}
                  onChange={handleChange}
                  placeholder="Enter second person's name"
                  required={parseInt(formData.people) >= 2}
                />
              </label>
            )}
            {formData.people == 3 && (
              <label className="additional-person">
                3rd Person Name: *
                <input
                  type="text"
                  name="person3"
                  value={formData.person3}
                  onChange={handleChange}
                  placeholder="Enter third person's name"
                  required
                />
              </label>
            )}
          </div>
          <div className="pickup-section">
            <h4>📍 Pickup Location</h4>

            {/* Enhanced Address Input with Google Maps Integration */}
            <div className="address-input-container">
              <label>
                Pickup Address:
                <input
                  type="text"
                  name="address"
                  value={locationData.address}
                  onChange={(e) => setLocationData({ ...locationData, address: e.target.value })}
                  placeholder="Enter your complete pickup address..."
                  required
                  className="simple-address-input"
                />
                <small className="address-help">
                  Please provide your complete address including area, city, and pincode
                </small>
              </label>
            </div>
          </div>


          <div className="visit-duration">
            <strong>Hours of Visit & Charges:</strong>
            <div className="duration-box">
              1 Hour - ₹300
            </div>
            <p>Additional charges: ₹5 per minute</p>
          </div>
          <div className="payment-method">
            <strong>Payment Method:</strong>
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="previsit"
                checked={formData.paymentMethod === 'previsit'}
                onChange={handlePaymentMethodChange}
              />
              Previsit
            </label>
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="postvisit"
                checked={formData.paymentMethod === 'postvisit'}
                onChange={handlePaymentMethodChange}
              />
              Postvisit
            </label>
          </div>
          {formData.paymentMethod === 'previsit' && (
            <div className="gpay-section">
              <p>Please scan the QR code below to complete your payment:</p>
              <img src="/images/gpay-qr.png" alt="GPay QR Code" className="qr-code" />
            </div>
          )}
          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Booking...' : 'Book'}
            </button>
            <button type="button" onClick={() => alert('Reschedule functionality coming soon!')}>Reschedule</button>
            <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
          </div>
        </form>
      </div>
      <div className="info-section ui-bg">
        <h3>Note:</h3>
        <p>
          After booking a site visit, a car will pick you up from your address, take you to the site, and drop you back at your address.
        </p>
        <p>
          If you decide to purchase the property, the visit charges will be refunded.
        </p>
      </div>
    </div>
  );
};

export default BookSiteVisit;