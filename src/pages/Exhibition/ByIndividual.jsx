import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { User, MapPin, Home, Maximize2, Phone, Eye, Calendar, Radio, Building2 } from 'lucide-react';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const ByIndividual = () => {
  const navigate = useNavigate();
  
  const properties = [
    {
      id: 1,
      title: "Modern 3BHK Apartment",
      owner: "Rajesh Kumar",
      location: "Alkapuri, Vadodara",
      price: "₹65 Lakhs",
      image: "/placeholder-property.jpg",
      type: "Apartment",
      area: "1450 sq.ft"
    },
    {
      id: 2,
      title: "Luxury Villa with Garden",
      owner: "Priya Sharma",
      location: "Gotri, Vadodara",
      price: "₹1.2 Cr",
      image: "/placeholder-property.jpg",
      type: "Villa",
      area: "2800 sq.ft"
    },
    {
      id: 3,
      title: "Commercial Shop Space",
      owner: "Amit Patel",
      location: "RC Dutt Road, Vadodara",
      price: "₹45 Lakhs",
      image: "/placeholder-property.jpg",
      type: "Commercial",
      area: "800 sq.ft"
    }
  ];

  const tabs = [
    { value: 'individual', label: 'By Individual', href: '/exhibition/individual', icon: User },
    { value: 'developer', label: 'By Developer', href: '/exhibition/developer', icon: Building2 },
    { value: 'live', label: 'Live Grouping', href: '/exhibition/live-grouping', icon: Radio, live: true },
    { value: 'badabuilder', label: 'By Bada Builder', href: '/exhibition/badabuilder', icon: Home }
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-gray-500 italic mb-2">— Exhibition —</p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Properties by Individual Owners
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Direct listings from property owners - No middleman, better deals
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          className="flex justify-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="inline-flex flex-wrap justify-center gap-2 p-2 bg-white rounded-xl border border-gray-200 shadow-sm">
            {tabs.map((tab) => (
              <Link key={tab.value} to={tab.href}>
                <Button
                  variant={tab.value === 'individual' ? 'default' : 'ghost'}
                  className={cn(
                    "gap-2 rounded-lg",
                    tab.value === 'individual'
                      ? "bg-gray-900 text-white hover:bg-gray-800"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.live && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                  <span className="hidden sm:inline">{tab.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm group hover:shadow-md transition-shadow">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={property.image} 
                    alt={property.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <Badge className="absolute top-4 left-4 bg-gray-900 text-white">
                    Individual
                  </Badge>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {property.title}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <p className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      {property.owner}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {property.location}
                    </p>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <Badge variant="outline" className="border-gray-200 text-gray-600">
                      <Home className="w-3 h-3 mr-1" />
                      {property.type}
                    </Badge>
                    <Badge variant="outline" className="border-gray-200 text-gray-600">
                      <Maximize2 className="w-3 h-3 mr-1" />
                      {property.area}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xl font-bold text-gray-900">
                      {property.price}
                    </p>
                    <Button size="sm" className="gap-1 bg-gray-900 text-white hover:bg-gray-800">
                      <Phone className="w-3 h-3" />
                      Contact
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {properties.length === 0 && (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Home className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties available yet</h3>
            <p className="text-gray-500">Check back soon for new listings from individual owners</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ByIndividual;
