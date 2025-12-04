// src/pages/BookSiteVisit.jsx
import React, { useState } from 'react';
import './BookSiteVisit.css';

const BookSiteVisit = () => {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePaymentMethodChange = (e) => {
    setFormData({ ...formData, paymentMethod: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Implement form submission logic here
    console.log('Form submitted:', formData);
    alert('Your site visit has been booked!');
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
            <button type="submit">Book</button>
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