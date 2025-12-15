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

      await addDoc(collection(db, 'bookings'), bookingData);

      // Email notification (console log for MVP)
      const emailBody = `
        ========================================
        NEW SITE VISIT BOOKING
        ========================================
        
        Property: ${property?.title || 'Unknown Property'}
        Property ID: ${property?.id || 'N/A'}
        
        User Details:
        - Email: ${currentUser.email}
        - User ID: ${currentUser.uid}
        
        Visit Details:
        - Date: ${formData.date}
        - Time: ${formData.time}
        - Number of People: ${formData.people}
        - Person 1: ${formData.person1}
        ${formData.person2 ? `- Person 2: ${formData.person2}` : ''}
        ${formData.person3 ? `- Person 3: ${formData.person3}` : ''}
        
        Pickup Address:
        ${formData.address}
        
        Payment Method: ${formData.paymentMethod}
        
        ========================================
      `;

      console.log('📧 EMAIL NOTIFICATION TO ADMIN:', emailBody);

      alert('Your site visit has been booked successfully!');
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
            <input type="number" name="people" value={formData.people} onChange={handleChange} min="1" max="3" required />
          </label>
          <label>
            1st Person Name:
            <input type="text" name="person1" value={formData.person1} onChange={handleChange} required />
          </label>
          {formData.people >= 2 && (
            <label>
              2nd Person Name:
              <input type="text" name="person2" value={formData.person2} onChange={handleChange} />
            </label>
          )}
          {formData.people === 3 && (
            <label>
              3rd Person Name:
              <input type="text" name="person3" value={formData.person3} onChange={handleChange} />
            </label>
          )}
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
            <button type="button" onClick={() => alert('Cancel functionality coming soon!')}>Cancel</button>
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