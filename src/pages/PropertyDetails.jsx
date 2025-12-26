import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './ProjectDetails.css';
import { FiPhone, FiCheckCircle, FiInfo, FiMap } from 'react-icons/fi';
import { FaChevronLeft, FaChevronRight, FaExpand } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const PropertyDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const getPropertyData = async () => {
      if (location.state?.property) {
        setProperty(location.state.property);
        setLoading(false);
      } else if (id) {
        try {
          const docRef = doc(db, 'properties', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProperty({ id: docSnap.id, ...docSnap.data() });
          }
        } catch (error) {
          console.error("Error fetching property:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    getPropertyData();
  }, [id, location.state]);

  const nextImage = () => {
    if (!propertyImages.length) return;
    setCurrentImageIndex((prev) => (prev + 1) % propertyImages.length);
  };

  const prevImage = () => {
    if (!propertyImages.length) return;
    setCurrentImageIndex((prev) => (prev - 1 + propertyImages.length) % propertyImages.length);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="spinner mb-4"></div>
        <p className="text-gray-400">Loading property details...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Property not found</h2>
        <button
          onClick={() => navigate(-1)}
          className="text-blue-500 hover:underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Prepare dynamic data
  const isDeveloper = property.user_type === 'developer';
  const propertyTitle = property.project_name || property.projectName || property.title;
  const propertyImages = property.project_images || property.images || (property.image_url ? [property.image_url] : []) || [];

  const propertyTags = isDeveloper
    ? [property.scheme_type || property.type, property.possession_status].filter(Boolean)
    : property.tags || [property.status, property.type].filter(Boolean);

  if (property.rera_status === 'Yes' && !propertyTags.includes('RERA Registered')) {
    propertyTags.push('RERA Registered');
  }

  const propertyFacilities = property.amenities || property.facilities || [];
  const displayPrice = property.price ||
    (property.base_price && property.max_price ? `₹ ${property.base_price} - ₹ ${property.max_price}` : null) ||
    property.groupPrice ||
    property.priceRange ||
    'Contact for Price';

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-20">

      {/* Modern Image Slider */}
      <div className="relative w-full h-[300px] md:h-[500px] bg-gray-900 rounded-3xl overflow-hidden shadow-2xl mb-8 group flex items-center justify-center">
        {propertyImages.length > 0 ? (
          <>
            <AnimatePresence mode='wait'>
              <motion.img
                key={currentImageIndex}
                src={propertyImages[currentImageIndex]}
                alt={`Property Image ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.4 }}
              />
            </AnimatePresence>

            {/* Controls */}
            <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all hover:scale-110"
              >
                <FaChevronLeft size={24} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all hover:scale-110"
              >
                <FaChevronRight size={24} />
              </button>
            </div>

            {/* Brochure and Count Badge */}
            <div className="absolute top-4 right-4 flex gap-3">
              <span className="bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-medium">
                {currentImageIndex + 1} / {propertyImages.length}
              </span>
              {(property.brochure_url || property.brochure) && (
                <a
                  href={property.brochure_url || property.brochure}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-1.5 bg-white text-black text-sm font-bold rounded-full shadow-lg hover:bg-gray-200 transition"
                >
                  Download Brochure
                </a>
              )}
            </div>

            {/* Thumbnails Strip */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90%] p-2 bg-black/30 backdrop-blur-sm rounded-2xl scrollbar-hide">
              {propertyImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`relative w-16 h-12 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${currentImageIndex === idx ? 'border-blue-500 scale-110' : 'border-transparent opacity-70 hover:opacity-100'}`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <p className="text-gray-500">No images available</p>
          </div>
        )}
      </div>

      {/* Title & Header Section */}
      <div className="mt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="w-full md:w-auto text-left">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">{propertyTitle}</h1>
          <p className="text-gray-400 font-bold flex items-center gap-2">
            <FiMap /> {property.project_location || property.location}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {propertyTags.map((tag, i) => (
              <span key={i} className="px-4 py-1.5 text-xs font-bold ui-bg text-white rounded-full uppercase tracking-wider">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full md:w-auto">
          <button
            onClick={() => navigate('/book-visit', { state: { property } })}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl transition shadow-lg transform hover:-translate-y-1"
          >
            Book a Site Visit
          </button>
        </div>
      </div>

      {/* Price & Summary Stats */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Price Card */}
        <div className="lg:col-span-1 ui-bg p-8 rounded-2xl shadow-xl flex flex-col justify-center">
          <h2 className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-2">Investment Range</h2>
          <p className="text-3xl font-black text-white">{displayPrice}</p>
          <p className="text-sm text-gray-500 mt-2 font-medium">
            {property.scheme_type || property.type} {property.project_stats?.area && `• Project Area ${property.project_stats.area}`}
          </p>
        </div>

        {/* Project Quick Highlights (Developer Only) */}
        {isDeveloper && property.project_stats && (
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Towers', value: property.project_stats.towers },
              { label: 'Floors', value: property.project_stats.floors },
              { label: 'Total Units', value: property.project_stats.units },
              { label: 'Config', value: property.residential_options?.join('/') || 'Project' }
            ].map((stat, i) => (
              <div key={i} className="ui-bg p-4 rounded-2xl flex flex-col items-center justify-center text-center border border-gray-800">
                <span className="text-gray-500 text-xs font-bold uppercase mb-1">{stat.label}</span>
                <span className="text-xl font-black text-white">{stat.value || '--'}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Compliance & Status (Developer Specific) */}
        {isDeveloper && (
          <div className="space-y-6">
            <h2 className="text-2xl font-extrabold">Project Compliance</h2>
            <div className="ui-bg p-6 rounded-2xl border border-gray-800 space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400 font-bold flex items-center gap-2"><FiCheckCircle className="text-green-500" /> RERA Status</span>
                <span className="font-bold">{property.rera_status === 'Yes' ? 'Registered' : 'N/A'}</span>
              </div>
              {property.rera_number && (
                <div className="flex flex-col gap-1 py-1">
                  <span className="text-gray-400 text-xs font-bold uppercase">RERA ID</span>
                  <span className="font-mono text-sm bg-black p-2 rounded text-blue-400 break-all">{property.rera_number}</span>
                </div>
              )}
              <div className="flex items-center justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400 font-bold flex items-center gap-2"><FiInfo className="text-blue-500" /> Possession</span>
                <span className="font-bold">{property.possession_status}</span>
              </div>
              {property.completion_date && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-400 font-bold">Exp. Completion</span>
                  <span className="font-bold text-orange-400">{property.completion_date}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Options / Configurations */}
        {(property.residential_options?.length > 0 || property.commercial_options?.length > 0) && (
          <div className="space-y-6">
            <h2 className="text-2xl font-extrabold">Available Options</h2>
            <div className="ui-bg p-6 rounded-2xl border border-gray-800">
              {property.residential_options?.length > 0 && (
                <div className="mb-4">
                  <p className="text-gray-500 text-xs font-bold uppercase mb-3">Residential</p>
                  <div className="flex flex-wrap gap-2">
                    {property.residential_options.map((opt, i) => (
                      <span key={i} className="px-3 py-1 bg-purple-900/40 text-purple-200 border border-purple-800/50 rounded-lg text-sm font-bold">{opt}</span>
                    ))}
                  </div>
                </div>
              )}
              {property.commercial_options?.length > 0 && (
                <div>
                  <p className="text-gray-500 text-xs font-bold uppercase mb-3">Commercial</p>
                  <div className="flex flex-wrap gap-2">
                    {property.commercial_options.map((opt, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-900/40 text-blue-200 border border-blue-800/50 rounded-lg text-sm font-bold">{opt}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Facilities/Amenities */}
      {propertyFacilities.length > 0 && (
        <div className="mt-16">
          <h2 className="text-3xl font-extrabold mb-8 flex items-center gap-3">
            Premium Features
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {propertyFacilities.map((facility, idx) => (
              <div key={idx} className="p-4 ui-bg rounded-2xl text-center text-sm font-bold border border-gray-800 hover:border-blue-500 transition-colors shadow-sm">
                {facility}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Developer/Seller Info */}
      <div className="mt-16 bg-gradient-to-r from-gray-900 to-black p-8 rounded-3xl border border-gray-800 shadow-2xl">
        <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] mb-6">
          {isDeveloper ? 'Project Developer' : property.owner ? 'Property Owner' : 'Verified Seller'}
        </h2>
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            {property.logo && (
              <div className="h-20 w-20 bg-white rounded-2xl p-2 flex items-center justify-center shadow-inner">
                <img
                  src={property.logo}
                  alt="Logo"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            )}
            <div>
              <p className="text-2xl font-black text-white tracking-tight">
                {property.developer || property.company_name || property.owner_name || property.owner || 'Premium Partner'}
              </p>
              <p className="text-gray-500 font-bold uppercase text-xs tracking-wider flex items-center gap-2 mt-1">
                {isDeveloper ? 'Trusted Builder' : 'Property Owner'} • Since {new Date(property.created_at).getFullYear() || '2024'}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-auto">
            {property.contact_phone && (
              <a
                href={`tel:+91${property.contact_phone}`}
                className="flex items-center justify-center gap-3 bg-white text-black font-black px-8 py-4 rounded-2xl hover:bg-gray-200 transition transform hover:scale-105 active:scale-95 shadow-xl"
              >
                <FiPhone /> +91 {property.contact_phone}
              </a>
            )}
            <button className="text-blue-400 font-bold hover:text-blue-300 transition text-sm">
              View Developer Portfolio
            </button>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-16 max-w-4xl">
        <h2 className="text-2xl font-extrabold mb-6">About this Property</h2>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-400 leading-relaxed text-lg whitespace-pre-line">
            {property.description ||
              `This stunning ${property.type} is located in ${property.location} and offers excellent value for money. 
               Benefit from modern design, strategic location, and premium amenities. 
               Contact us today to schedule an exclusive site visit.`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
