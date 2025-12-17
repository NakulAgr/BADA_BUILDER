import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Check, Loader2, Crown, Sparkles, Zap, Shield, ArrowRight } from 'lucide-react';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

const plans = [
  {
    id: '1month',
    duration: '1 Month',
    price: 3000,
    features: ['Post unlimited properties', 'Featured listing for 7 days', 'Email support'],
    icon: Zap
  },
  {
    id: '3months',
    duration: '3 Months',
    price: 8000,
    features: ['Post unlimited properties', 'Featured listing for 21 days', 'Priority email support', 'Save ₹1,000'],
    popular: true,
    icon: Sparkles
  },
  {
    id: '6months',
    duration: '6 Months',
    price: 15000,
    features: ['Post unlimited properties', 'Featured listing for 45 days', 'Priority support', 'Save ₹3,000'],
    icon: Shield
  },
  {
    id: '12months',
    duration: '12 Months',
    price: 25000,
    features: ['Post unlimited properties', 'Featured listing for 90 days', 'Dedicated support', 'Save ₹11,000'],
    bestValue: true,
    icon: Crown
  }
];

const SubscriptionPlans = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [error, setError] = useState('');

  const calculateExpiryDate = (months) => {
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return date.toISOString();
  };

  const handleSelectPlan = async (plan) => {
    if (!isAuthenticated) {
      setError('Please login to subscribe');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    setSelectedPlan(plan.id);
    setLoading(true);
    setError('');

    try {
      let months = 1;
      if (plan.id === '3months') months = 3;
      else if (plan.id === '6months') months = 6;
      else if (plan.id === '12months') months = 12;

      const expiryDate = calculateExpiryDate(months);

      await updateDoc(doc(db, 'users', currentUser.uid), {
        is_subscribed: true,
        subscription_expiry: expiryDate,
        subscription_plan: plan.id,
        subscription_price: plan.price,
        subscribed_at: new Date().toISOString()
      });

      navigate('/post-property');
    } catch (error) {
      console.error('Error updating subscription:', error);
      setError('Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-gray-500 italic mb-2">— Pricing —</p>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Select a subscription plan to start posting properties
          </p>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="max-w-md mx-auto mb-8">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className={cn(
                "relative bg-white rounded-2xl p-6 h-full flex flex-col border shadow-sm",
                (plan.popular || plan.bestValue) ? "border-gray-900 border-2" : "border-gray-200"
              )}>
                {/* Badges */}
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4">
                    Most Popular
                  </Badge>
                )}
                {plan.bestValue && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-white px-4">
                    Best Value
                  </Badge>
                )}

                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4 mt-2">
                  <plan.icon className={cn(
                    "w-6 h-6",
                    plan.bestValue ? "text-yellow-600" : "text-gray-700"
                  )} />
                </div>

                {/* Plan Details */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.duration}</h3>
                <div className="mb-6">
                  <span className="text-gray-500 text-sm">₹</span>
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price.toLocaleString()}
                  </span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6 flex-grow">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <Button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={loading && selectedPlan === plan.id}
                  className={cn(
                    "w-full gap-2",
                    plan.popular || plan.bestValue
                      ? "bg-gray-900 text-white hover:bg-gray-800"
                      : "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50"
                  )}
                >
                  {loading && selectedPlan === plan.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Select Plan
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Note */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <p className="text-gray-500 text-sm">
            Note: This is a demo implementation. In production, integrate with a payment gateway.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
