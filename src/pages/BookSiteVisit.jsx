// src/pages/BookSiteVisit.jsx
import React, { useState } from 'react';
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
    address: '',
    paymentMethod: 'postvisit',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
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
        pickup_address: formData.address,
        payment_method: formData.paymentMethod,
        created_at: new Date().toISOString(),
        status: 'pending'
      };

      const docRef = await addDoc(collection(db, 'bookings'), bookingData);
      
      // Add booking ID to data
      bookingData.booking_id = docRef.id;
      bookingData.property_location = property?.location || 'N/A';

      // Send email and SMS notifications to admin
      try {
        const response = await fetch('http://localhost:3002/api/notify-booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingData)
        });

        const result = await response.json();
        
        if (result.success) {
          console.log('✅ Notifications sent to admin successfully');
        } else {
          console.warn('⚠️ Notification sending failed:', result.error);
        }
      } catch (notificationError) {
        console.error('❌ Error sending notifications:', notificationError);
        // Continue even if notification fails
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
          <label>
            Date:
            <input type="date" name="date" value={formData.date} onChange={handleChange} required />
          </label>
          <label>
            Time (10 AM - 5 PM):
            <input type="time" name="time" value={formData.time} onChange={handleChange} min="10:00" max="17:00" required />
          </label>
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
          <label>
            Pickup Address:
            <textarea name="address" value={formData.address} onChange={handleChange} required />
          </label>
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