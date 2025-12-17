import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Scale, Landmark, Palette, TrendingUp, BadgeDollarSign, Building, Shield, Check, ArrowRight, Phone, Sparkles } from 'lucide-react';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const services = [
  {
    id: 1,
    title: 'Legal Verification',
    description: 'Complete property document verification and legal clearance services',
    icon: Scale,
    features: ['Title verification', 'Document authentication', 'Legal compliance check'],
    link: null
  },
  {
    id: 2,
    title: 'Home Loans',
    description: 'Get the best home loan deals with competitive interest rates',
    icon: Landmark,
    features: ['Low interest rates', 'Quick approval', 'Flexible repayment'],
    link: null
  },
  {
    id: 3,
    title: 'Interior Design',
    description: 'Professional interior design services for your dream home',
    icon: Palette,
    features: ['Custom designs', '3D visualization', 'Turnkey solutions'],
    link: null
  },
  {
    id: 4,
    title: 'Investment Advisory',
    description: 'Expert guidance on real estate investments and portfolio management',
    icon: TrendingUp,
    features: ['ROI analysis', 'Market insights', 'Investment strategies'],
    link: '/investments',
    featured: true
  },
  {
    id: 5,
    title: 'Property Valuation',
    description: 'Accurate property valuation by certified professionals',
    icon: BadgeDollarSign,
    features: ['Market analysis', 'Detailed reports', 'Expert consultation'],
    link: null
  },
  {
    id: 6,
    title: 'Property Management',
    description: 'End-to-end property management and maintenance services',
    icon: Building,
    features: ['Tenant management', 'Maintenance', 'Rent collection'],
    link: null
  },
  {
    id: 7,
    title: 'Insurance Services',
    description: 'Comprehensive property and home insurance solutions',
    icon: Shield,
    features: ['Property insurance', 'Home insurance', 'Claim assistance'],
    link: null
  }
];

const Services = () => {
  const navigate = useNavigate();

  const handleServiceClick = (service) => {
    if (service.link) {
      navigate(service.link);
    } else {
      navigate('/contact');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-20">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-gray-500 italic mb-2">— What We Offer —</p>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Services
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Comprehensive real estate solutions for all your needs
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className={cn(
                "bg-white rounded-2xl p-6 h-full border border-gray-200 shadow-sm",
                "group hover:shadow-md transition-all duration-300",
                "flex flex-col"
              )}>
                {/* Icon & Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                    <service.icon className="w-6 h-6 text-gray-700" />
                  </div>
                  {service.featured && (
                    <Badge className="bg-gray-900 text-white">
                      Popular
                    </Badge>
                  )}
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {service.title}
                </h3>
                <p className="text-gray-500 text-sm mb-4 flex-grow">
                  {service.description}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-600 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <Button
                  variant={service.featured ? "default" : "outline"}
                  className={cn(
                    "w-full gap-2 mt-auto",
                    service.featured 
                      ? "bg-gray-900 text-white hover:bg-gray-800" 
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  )}
                  onClick={() => handleServiceClick(service)}
                >
                  {service.link ? 'Explore Now' : 'Learn More'}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-200 shadow-sm max-w-xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Need Help Choosing?
            </h2>
            <p className="text-gray-500 mb-8">
              Our experts are here to guide you through every step
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/contact')}
              className="gap-2 bg-gray-900 text-white hover:bg-gray-800 rounded-full"
            >
              <Phone className="w-4 h-4" />
              Contact Us
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Services;
