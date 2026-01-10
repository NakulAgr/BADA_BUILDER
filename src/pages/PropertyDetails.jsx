import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
<<<<<<< Updated upstream
import './PropertyDetails.css';
import { FiPhone, FiCheckCircle, FiInfo, FiMap, FiHome, FiMaximize2, FiBriefcase, FiUser, FiX } from 'react-icons/fi';
import { FaChevronLeft, FaChevronRight, FaBed, FaBath, FaCouch } from 'react-icons/fa';
=======
import './ProjectDetails.css';
import { FiPhone, FiCheckCircle, FiInfo, FiMap } from 'react-icons/fi';
import { FaChevronLeft, FaChevronRight, FaExpand, FaPlay, FaPause } from 'react-icons/fa';
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
import { motion, AnimatePresence } from 'framer-motion';

const PropertyDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSlideshow, setIsSlideshow] = useState(false);

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

  // Auto-slideshow effect
  useEffect(() => {
    if (!isSlideshow || !property) return;
    
    const propertyImages = property.project_images || property.images || (property.image_url ? [property.image_url] : []) || [];
    if (propertyImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % propertyImages.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [isSlideshow, property]);

  const nextImage = () => {
    if (!propertyImages.length) return;
    setCurrentImageIndex((prev) => (prev + 1) % propertyImages.length);
  };


  const prevImage = () => {
    if (!propertyImages.length) return;
    setCurrentImageIndex((prev) => (prev - 1 + propertyImages.length) % propertyImages.length);
  };

  // Full Screen Image Viewer Logic
  const [isFullScreen, setIsFullScreen] = useState(false);

  const openFullScreen = () => {
    setIsFullScreen(true);
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
  };

  const closeFullScreen = () => {
    setIsFullScreen(false);
    // Restore body scrolling
    document.body.style.overflow = 'unset';
  };

  const handleKeyDown = (e) => {
    if (!isFullScreen) return;

    if (e.key === 'Escape') {
      closeFullScreen();
    } else if (e.key === 'ArrowLeft') {
      prevImage();
    } else if (e.key === 'ArrowRight') {
      nextImage();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset'; // Safety cleanup
    };
  }, [isFullScreen, currentImageIndex]); // Re-bind when index changes for correct closure


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gray-50 min-h-screen">
        <div className="loading-spinner"></div>
        <p className="text-gray-600 font-medium mt-4">Loading property details...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-20 bg-gray-50 min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-4">Property Not Found</h2>
        <p className="text-gray-600 mb-6">The property you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate(-1)}
          className="btn-primary-redesign"
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

  // Default amenities if none provided
  const defaultAmenities = ['Lift', 'Parking', 'Garden', 'Security', 'Gym', 'Power Backup'];
  const displayAmenities = propertyFacilities.length > 0 ? propertyFacilities : defaultAmenities;
  const displayPrice = property.price ||
    (property.base_price && property.max_price ? `₹${property.base_price} - ₹${property.max_price}` : null) ||
    property.groupPrice ||
    property.priceRange ||
    'Contact for Price';

  return (
    <div className="property-details-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-6 pb-24 lg:pb-12">

        {/* Image Gallery Section */}
        <div className="mb-8 lg:mb-4">
          <div className="slider-container relative w-full h-[400px] md:h-[500px] lg:h-[450px] rounded-2xl overflow-hidden shadow-xl mx-auto">
            {propertyImages.length > 0 ? (
              <>
                <AnimatePresence mode='wait'>
                  <motion.img
                    key={currentImageIndex}
                    src={propertyImages[currentImageIndex]}
                    alt={`Property Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-contain cursor-pointer"
                    onClick={openFullScreen}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    onDragEnd={(e, { offset, velocity }) => {
                      const swipe = Math.abs(offset.x) * velocity.x;
                      if (swipe < -100) {
                        nextImage();
                      } else if (swipe > 100) {
                        prevImage();
                      }
                    }}
                  />
                </AnimatePresence>

                {/* Navigation Controls */}
                {propertyImages.length > 1 && (
                  <div className="slider-controls absolute inset-0 flex items-center justify-between p-4 pointer-events-none">
                    <button
                      onClick={prevImage}
                      className="pointer-events-auto bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all"
                      aria-label="Previous image"
                    >
                      <FaChevronLeft size={20} className="text-gray-800" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="pointer-events-auto bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all"
                      aria-label="Next image"
                    >
                      <FaChevronRight size={20} className="text-gray-800" />
                    </button>
                  </div>
                )}

<<<<<<< Updated upstream
<<<<<<< Updated upstream
                {/* Image Counter */}
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold">
                  {currentImageIndex + 1} / {propertyImages.length}
=======
=======
>>>>>>> Stashed changes
            {/* Brochure, Slideshow and Count Badge */}
            <div className="absolute top-4 right-4 flex gap-3">
              <span className="bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-medium">
                {currentImageIndex + 1} / {propertyImages.length}
              </span>
              {propertyImages.length > 1 && (
                <button
                  onClick={() => setIsSlideshow(!isSlideshow)}
                  className={`p-2 backdrop-blur-md rounded-full text-white transition-all hover:scale-110 ${
                    isSlideshow ? 'bg-green-500/80 hover:bg-green-600/80' : 'bg-black/50 hover:bg-black/70'
                  }`}
                  title={isSlideshow ? 'Pause Slideshow' : 'Play Slideshow'}
                >
                  {isSlideshow ? <FaPause size={16} /> : <FaPlay size={16} />}
                </button>
              )}
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
>>>>>>> Stashed changes
                </div>

                {/* Thumbnail Strip */}
                {propertyImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 max-w-[90%] overflow-x-auto scrollbar-hide">
                    {propertyImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`flex-shrink-0 w-16 h-12 md:w-20 md:h-16 rounded-lg overflow-hidden border-2 transition-all ${currentImageIndex === idx
                          ? 'border-blue-500 scale-110 shadow-lg'
                          : 'border-white/50 opacity-70 hover:opacity-100 hover:border-white'
                          }`}
                      >
                        <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <p className="text-gray-400 font-medium">No images available</p>
              </div>
            )}
          </div>
        </div>

        {/* Property Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 leading-tight">
                {propertyTitle}
              </h1>
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <FiMap className="text-blue-600 flex-shrink-0" size={20} />
                <p className="text-lg font-medium">{property.project_location || property.location}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {propertyTags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold border border-blue-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3 lg:min-w-[200px]">
              <button
                onClick={() => navigate('/book-visit', { state: { property } })}
                className="btn-primary-redesign w-full text-center whitespace-nowrap"
              >
                Book Site Visit
              </button>
            </div>
          </div>
        </div>

        {/* Price & Key Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Price Card */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Price</p>
            <p className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{displayPrice}</p>
            {property.type && (
              <p className="text-gray-600 font-medium">{property.type}</p>
            )}
          </div>

          {/* Individual Property Specs */}
          {!isDeveloper && (
            <>
              {property.bhk && (
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 flex flex-col items-center justify-center text-center">
                  <FaBed className="text-blue-600 mb-2" size={32} />
                  <p className="text-2xl font-bold text-gray-900">{property.bhk}</p>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Bedrooms</p>
                </div>
              )}
              {property.bathrooms && (
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 flex flex-col items-center justify-center text-center">
                  <FaBath className="text-blue-600 mb-2" size={32} />
                  <p className="text-2xl font-bold text-gray-900">{property.bathrooms}</p>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Bathrooms</p>
                </div>
              )}
              {property.area && (
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 flex flex-col items-center justify-center text-center">
                  <FiMaximize2 className="text-blue-600 mb-2" size={32} />
                  <p className="text-2xl font-bold text-gray-900">{property.area}</p>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Built-up Area</p>
                </div>
              )}
              {property.furnishing && (
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 flex flex-col items-center justify-center text-center">
                  <FaCouch className="text-blue-600 mb-2" size={32} />
                  <p className="text-2xl font-bold text-gray-900">{property.furnishing}</p>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Furnishing</p>
                </div>
              )}
            </>
          )}

          {/* Developer Project Stats */}
          {isDeveloper && property.project_stats && (
            <>
              {property.project_stats.towers && (
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 flex flex-col items-center justify-center text-center">
                  <FiHome className="text-blue-600 mb-2" size={32} />
                  <p className="text-2xl font-bold text-gray-900">{property.project_stats.towers}</p>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Towers</p>
                </div>
              )}
              {property.project_stats.units && (
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 flex flex-col items-center justify-center text-center">
                  <FiBriefcase className="text-blue-600 mb-2" size={32} />
                  <p className="text-2xl font-bold text-gray-900">{property.project_stats.units}</p>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total Units</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Two Column Layout for Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

          {/* Property Specifications */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FiInfo className="text-blue-600" />
              Property Details
            </h2>
            <div className="space-y-4">
              {!isDeveloper && (
                <>
                  {property.type && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Property Type</span>
                      <span className="text-gray-900 font-semibold">{property.type}</span>
                    </div>
                  )}
                  {property.bhk && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Configuration</span>
                      <span className="text-gray-900 font-semibold">{property.bhk}</span>
                    </div>
                  )}
                  {property.area && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Built-up Area</span>
                      <span className="text-gray-900 font-semibold">{property.area}</span>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Bathrooms</span>
                      <span className="text-gray-900 font-semibold">{property.bathrooms}</span>
                    </div>
                  )}
                  {property.furnishing && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Furnishing Status</span>
                      <span className="text-gray-900 font-semibold">{property.furnishing}</span>
                    </div>
                  )}
                  {property.status && (
                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-600 font-medium">Availability</span>
                      <span className="text-gray-900 font-semibold">{property.status}</span>
                    </div>
                  )}
                </>
              )}

              {isDeveloper && (
                <>
                  {property.scheme_type && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Scheme Type</span>
                      <span className="text-gray-900 font-semibold">{property.scheme_type}</span>
                    </div>
                  )}
                  {property.possession_status && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Possession Status</span>
                      <span className="text-gray-900 font-semibold">{property.possession_status}</span>
                    </div>
                  )}
                  {property.completion_date && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Expected Completion</span>
                      <span className="text-orange-600 font-semibold">{property.completion_date}</span>
                    </div>
                  )}
                  {property.rera_status && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">RERA Status</span>
                      <span className={`font-semibold ${property.rera_status === 'Yes' ? 'text-green-600' : 'text-gray-900'}`}>
                        {property.rera_status === 'Yes' ? 'Registered' : 'N/A'}
                      </span>
                    </div>
                  )}
                  {property.rera_number && (
                    <div className="flex flex-col gap-2 py-3">
                      <span className="text-gray-600 font-medium">RERA Number</span>
                      <div className="rera-box">{property.rera_number}</div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Owner/Developer Contact */}
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 md:p-8 shadow-md border border-blue-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FiUser className="text-blue-600" />
              {isDeveloper ? 'Developer Contact' : 'Owner Contact'}
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  {isDeveloper ? 'Developer Name' : 'Owner Name'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {property.developer || property.company_name || property.owner_name || property.owner || 'Property Owner'}
                </p>
              </div>

              {property.contact_phone && (
                <div className="pt-4">
                  <a
                    href={`tel:+91${property.contact_phone}`}
                    className="developer-contact-btn w-full justify-center"
                  >
                    <FiPhone size={20} />
                    +91 {property.contact_phone}
                  </a>
                </div>
              )}

              <div className="pt-2">
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-green-600" size={20} />
                  <span className="text-sm font-semibold text-gray-700">
                    Verified {isDeveloper ? 'Builder' : 'Seller'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Amenities/Facilities - Always Show */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Amenities & Features</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {displayAmenities.map((facility, idx) => (
              <div
                key={idx}
                className="feature-tag bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-center font-semibold"
              >
                {facility}
              </div>
            ))}
          </div>
        </div>

        {/* Developer Options */}
        {isDeveloper && (property.residential_options?.length > 0 || property.commercial_options?.length > 0) && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Configurations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {property.residential_options?.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Residential</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.residential_options.map((opt, i) => (
                      <span
                        key={i}
                        className="px-4 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-sm font-semibold"
                      >
                        {opt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {property.commercial_options?.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Commercial</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.commercial_options.map((opt, i) => (
                      <span
                        key={i}
                        className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-semibold"
                      >
                        {opt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">About This Property</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {property.description ||
                `This ${property.type || 'property'} is located in ${property.location || 'a prime location'} and offers excellent value. Contact us today to schedule a visit and explore this opportunity.`}
            </p>
          </div>
        </div>
      </div>

      {/* Full Screen Image Viewer Modal */}
      <AnimatePresence>
        {isFullScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fullscreen-overlay"
            onClick={closeFullScreen}
          >
            {/* Close Button */}
            <button
              className="fullscreen-close-btn"
              onClick={(e) => {
                e.stopPropagation();
                closeFullScreen();
              }}
              aria-label="Close Full Screen"
            >
              <FiX size={32} />
            </button>

            {/* Navigation Buttons (Desktop) */}
            {propertyImages.length > 1 && (
              <>
                <button
                  className="fullscreen-nav-btn prev"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  aria-label="Previous Image"
                >
                  <FaChevronLeft size={32} />
                </button>
                <button
                  className="fullscreen-nav-btn next"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  aria-label="Next Image"
                >
                  <FaChevronRight size={32} />
                </button>
              </>
            )}

            {/* Main Image Container */}
            <div
              className="fullscreen-image-container"
              onClick={(e) => e.stopPropagation()} // Prevent close on image click
            >
              <motion.img
                key={currentImageIndex}
                src={propertyImages[currentImageIndex]}
                alt={`Full Screen Image ${currentImageIndex + 1}`}
                className="fullscreen-image"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = Math.abs(offset.x) * velocity.x;
                  if (swipe < -100) {
                    nextImage();
                  } else if (swipe > 100) {
                    prevImage();
                  }
                }}
              />
              {/* Image Counter */}
              <div className="fullscreen-counter">
                {currentImageIndex + 1} / {propertyImages.length}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PropertyDetails;
