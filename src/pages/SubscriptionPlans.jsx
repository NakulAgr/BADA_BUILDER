import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './SubscriptionPlans.css';

/* ---------- BASE PLANS (Individual) ---------- */
const individualPlans = [
  {
    id: '1month',
    duration: '1 Month',
    price: 100,
    features: ['Post 1 property', 'Featured listing for 1 month', 'Email support']
  },
  {
    id: '6months',
    duration: '6 Months',
    price: 400,
    features: ['Post 1 property', 'Featured listing for 6 month', 'Email support'],
    popular: true
  },
  {
    id: '12months',
    duration: '12 Month',
    price: 700,
    features: ['Post 1 property', 'Featured listing for 1 year', 'Email support']
  }
];

/* ---------- DEVELOPER / BUILDER PLAN ---------- */
const developerPlan = {
  id: 'dev_12months',
  duration: '12 Month',
  price: 20000,
  features: [
    'Post 20 property',
    'Featured listing for 1 year',
    'Email support'
  ],
  bestValue: true
};

const SubscriptionPlans = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, userProfile } = useAuth();

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  /* ---------- LOAD RAZORPAY ---------- */
  useEffect(() => {
    if (window.Razorpay) {
      setRazorpayLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => alert('Failed to load payment gateway');
    document.body.appendChild(script);
  }, []);

  /* ---------- ROLE CHECK ---------- */
  const isDeveloper =
    userProfile?.role === 'developer' || userProfile?.role === 'builder';

  /* ---------- FINAL PLANS LIST ---------- */
  const plans = isDeveloper
    ? [...individualPlans, developerPlan]
    : individualPlans;

  const calculateExpiryDate = (months) => {
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return date.toISOString();
  };

  const handleRazorpayPayment = async (plan) => {
    if (!window.Razorpay) return false;

    let months = 1;
    if (plan.id === '6months') months = 6;
    else if (plan.id === '12months' || plan.id === 'dev_12months') months = 12;

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: plan.price * 100,
      currency: 'INR',
      name: 'Bada Builder',
      description: `Subscription Plan - ${plan.duration}`,
      image: '/logo.png',

      handler: async (response) => {
        try {
          const expiry = calculateExpiryDate(months);

          await addDoc(collection(db, 'payments'), {
            payment_id: response.razorpay_payment_id,
            user_id: currentUser.uid,
            amount: plan.price,
            plan_name: plan.id,
            payment_status: 'success',
            created_at: new Date().toISOString()
          });

          await updateDoc(doc(db, 'users', currentUser.uid), {
            active_plan: plan.id,
            plan_status: 'active',
            is_subscribed: true,
            subscription_expiry: expiry,
            can_post_property: true
          });

          alert('Subscription activated successfully');
          setPaymentLoading(false);
          navigate('/post-property', { replace: true });

        } catch (err) {
          console.error(err);
          alert('Payment success but activation failed');
          setPaymentLoading(false);
        }
      },

      prefill: {
        name: userProfile?.name || '',
        email: userProfile?.email || '',
        contact: userProfile?.phone || ''
      },

      modal: {
        ondismiss: () => {
          setPaymentLoading(false);
          setSelectedPlan(null);
          alert('Payment cancelled');
        }
      },

      theme: { color: '#58335e' }
    };

    new window.Razorpay(options).open();
    return true;
  };

  const handleSelectPlan = async (plan) => {
    if (paymentLoading) return;

    if (!isAuthenticated) {
      alert('Please login first');
      navigate('/login');
      return;
    }

    if (!razorpayLoaded) {
      alert('Payment gateway loading...');
      return;
    }

    setSelectedPlan(plan.id);
    setPaymentLoading(true);

    const ok = await handleRazorpayPayment(plan);
    if (!ok) {
      setPaymentLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="subscription-page">
      <div className="subscription-container">

        <motion.div className="subscription-header">
          <h1>Choose Your Plan</h1>
          <p>Select a subscription plan to start posting properties</p>
        </motion.div>

        <div className="plans-grid">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              className={`plan-card ${plan.popular ? 'popular' : ''} ${plan.bestValue ? 'best-value' : ''}`}
            >
              {plan.popular && <div className="badge">Most Popular</div>}
              {plan.bestValue && <div className="badge best">Developer Plan</div>}

              <div className="plan-header">
                <h3>{plan.duration}</h3>
                <div className="price">
                  <span className="currency">₹</span>
                  <span className="amount">{plan.price}</span>
                </div>
              </div>

              <ul className="features-list">
                {plan.features.map((f, i) => (
                  <li key={i}>✔ {f}</li>
                ))}
              </ul>

              <button
                className="select-button"
                onClick={() => handleSelectPlan(plan)}
                disabled={paymentLoading}
              >
                {paymentLoading && selectedPlan === plan.id
                  ? 'Processing Payment...'
                  : 'Choose Plan'}
              </button>
            </motion.div>
          ))}
        </div>

        <p className="subscription-note">
          🔒 Secure payment powered by Razorpay
        </p>

      </div>
    </div>
  );
};

export default SubscriptionPlans;
