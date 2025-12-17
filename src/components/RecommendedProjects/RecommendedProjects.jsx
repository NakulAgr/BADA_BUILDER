import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Eye, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import listings from '../../data/listings';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const RecommendedProjects = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4 bg-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-gray-500 italic mb-2">— Our Projects —</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Recommended Projects
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Handpicked properties that match the latest trends and offer exceptional value
          </p>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {listings.slice(0, 2).map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.2 }}
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 group hover:shadow-lg transition-shadow">
                {/* Image Container */}
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Tag Badge */}
                  {project.tags?.length > 0 && (
                    <Badge className="absolute top-4 left-4 bg-gray-900 text-white">
                      {project.tags[0]}
                    </Badge>
                  )}

                  {/* Quick View on Hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Link to={`/projects/${project.id}`}>
                      <Button variant="outline" className="gap-2 bg-white text-gray-900 hover:bg-gray-100 border-0">
                        <Eye className="w-4 h-4" />
                        Quick View
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {project.title}
                  </h3>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-gray-500 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{project.location}</span>
                  </div>

                  {/* Price */}
                  <p className="text-2xl font-bold text-gray-900 mb-4">
                    {project.priceRange}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Link to={`/projects/${project.id}`} className="flex-1">
                      <Button variant="outline" className="w-full gap-2 border-gray-300 text-gray-700 hover:bg-gray-50">
                        <Eye className="w-4 h-4" />
                        View Details
                      </Button>
                    </Link>
                    <Button 
                      onClick={() => navigate('/booksitevisit', { state: { property: project } })}
                      className="flex-1 gap-2 bg-gray-900 text-white hover:bg-gray-800"
                    >
                      <Calendar className="w-4 h-4" />
                      Book Visit
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-12"
        >
          <Link to="/exhibition">
            <Button variant="outline" className="gap-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full">
              View All Projects
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default RecommendedProjects;
