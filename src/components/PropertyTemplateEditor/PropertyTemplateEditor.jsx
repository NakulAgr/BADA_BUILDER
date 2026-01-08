import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPhone, FiCheckCircle, FiInfo, FiMap, FiUpload, FiCamera } from 'react-icons/fi';
// Reusing logic from PropertyDetails but as inputs
// We assumes styles are available globally or from imported CSS files in parent
// Importing PropertyTemplateEditor.css for input-specific overrides
import './PropertyTemplateEditor.css';

const PropertyTemplateEditor = ({ userType, onCancel, onSubmit, handleImageChange, imagePreview }) => {
    const isDeveloper = userType === 'developer';

    // Unified State Management
    const [formData, setFormData] = useState({
        // Common
        description: '',
        location: '',
        email: '',
        contactPhone: '',

        // Individual
        title: '',
        price: '',
        type: '', // Flat/House/etc
        area: '',
        bhk: '',
        bathrooms: '',
        furnishing: '',
        status: '', // Ready/Under Construction (Possession Status for Dev)
        ownerName: '',
        facilities: '', // String for comma-sep input

        // Developer
        projectName: '',
        schemeType: '',
        basePrice: '',
        maxPrice: '',
        projectStats: {
            units: '',
            towers: '',
            floors: '',
            area: '' // Project Area
        },
        possessionDate: '',
        reraStatus: 'No',
        reraNumber: '',
        commercialOptions: '', // Comma sep
        residentialOptions: '', // Comma sep
        developerName: ''
    });

    const [isPublishing, setIsPublishing] = useState(false);
    const [extraImages, setExtraImages] = useState([]); // Array of { file, preview }

    const handleExtraImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const newImages = files.map(file => ({
                file,
                preview: URL.createObjectURL(file)
            }));
            setExtraImages(prev => [...prev, ...newImages]);
        }
    };

    const removeExtraImage = (index) => {
        setExtraImages(prev => prev.filter((_, i) => i !== index));
    };

    const [errors, setErrors] = useState({});

    // Handle nested change for projectStats
    const handleStatChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            projectStats: {
                ...prev.projectStats,
                [field]: value
            }
        }));
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validate = () => {
        const newErrors = {};
        if (isDeveloper) {
            if (!formData.projectName) newErrors.projectName = "Project Name is required";
            if (!formData.location) newErrors.location = "Location is required";
            if (!formData.basePrice) newErrors.basePrice = "Min Price is required";
            if (!imagePreview) newErrors.image = "Main Image is required";
        } else {
            if (!formData.title) newErrors.title = "Property Title is required";
            if (!formData.location) newErrors.location = "Location is required";
            if (!formData.price) newErrors.price = "Price is required";
            if (!imagePreview) newErrors.image = "Property Image is required";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePost = async () => {
        if (!validate()) {
            const firstError = Object.values(errors)[0];
            if (firstError) alert(`Please fix errors: ${firstError}`);
            else alert("Please fill all required fields");
            return;
        }

        setIsPublishing(true);

        // Format data for submission
        // Convert comma-sep strings to arrays if needed, but PostProperty handles string splits often
        // propertyData.facilities expects array or comma string, so string is fine primarily if we send 'facilities' key
        // For developer options, we might need array

        const submissionData = { ...formData };

        // Ensure mapping consistency
        if (isDeveloper) {
            submissionData.residentialOptions = formData.residentialOptions ? formData.residentialOptions.split(',').map(s => s.trim()).filter(Boolean) : [];
            submissionData.commercialOptions = formData.commercialOptions ? formData.commercialOptions.split(',').map(s => s.trim()).filter(Boolean) : [];
            submissionData.projectLocation = formData.location;
            submissionData.ownerName = formData.developerName;
            submissionData.possessionStatus = formData.status;
            submissionData.completionDate = formData.possessionDate;
        } else {
            submissionData.projectLocation = formData.location; // Fallback
            submissionData.ownerName = formData.ownerName;
        }

        // Attach extra images for upload
        if (extraImages.length > 0) {
            submissionData.extraImages = extraImages.map(img => img.file);
        }

        try {
            await onSubmit(submissionData);
            // On success, parent usually redirects. If not, we might hang in loading, 
            // but parent handles success flow.
        } catch (error) {
            console.error("Publishing error:", error);
            alert("Failed to publish property. Please try again.");
            setIsPublishing(false);
        }
    };

    // Helper for input classes to look 'transparent' but visible
    const inputClass = "w-full bg-transparent border-b border-gray-600 focus:border-blue-500 outline-none transition-colors py-1 text-white placeholder-gray-600";
    const labelClass = "text-gray-500 text-xs font-bold uppercase mb-1 block";

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-20 bg-[#020617] text-white rounded-3xl relative">

            {/* Locking Overlay */}
            {isPublishing && (
                <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center cursor-wait">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <h2 className="text-xl font-bold text-white">Publishing your property...</h2>
                    <p className="text-gray-400 text-sm mt-2">Please do not close this window</p>
                </div>
            )}

            {/* Visual Editor Overlay Header */}
            <div className="absolute top-0 right-0 left-0 bg-blue-600/10 border-b border-blue-500/30 p-2 text-center text-blue-400 text-sm font-bold uppercase tracking-wider mb-4 rounded-t-3xl">
                Editable Preview Mode
            </div>

            {/* Error Banner */}
            {Object.keys(errors).length > 0 && (
                <div className="bg-red-500/20 border border-red-500 text-red-100 p-4 rounded-xl mb-6 mt-8">
                    <p className="font-bold flex items-center gap-2">⚠️ Please fix the following:</p>
                    <ul className="list-disc ml-5 text-sm mt-1">
                        {Object.values(errors).map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                </div>
            )}

            <div className="mt-8"></div>

            {/* Image Uploader Area (Replacing Slider) */}
            <div className={`relative w-full h-[300px] md:h-[400px] bg-gray-900 rounded-3xl overflow-hidden shadow-2xl mb-8 group flex items-center justify-center border-2 border-dashed border-gray-700 hover:border-blue-500 transition-colors cursor-pointer ${isPublishing ? 'pointer-events-none' : ''}`}>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={isPublishing}
                />

                {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                ) : (
                    <div className="flex flex-col items-center text-gray-400 gap-4">
                        <div className="p-4 bg-gray-800 rounded-full">
                            <FiCamera size={40} />
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-bold text-white">Upload Cover Image</p>
                            <p className="text-sm">Click here to browse files</p>
                        </div>
                    </div>
                )}

                {imagePreview && (
                    <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 pointer-events-none">
                        <FiUpload /> Change Image
                    </div>
                )}
            </div>

            {/* Additional Property Images (Grid) */}
            <div className="mb-8 p-4 bg-gray-800/30 border border-gray-700 rounded-2xl">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Additional Property Images</h3>
                <div className="flex flex-wrap gap-4">
                    {extraImages.map((img, idx) => (
                        <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-600 group">
                            <img src={img.preview} alt={`Extra ${idx}`} className="w-full h-full object-cover" />
                            <button
                                onClick={() => removeExtraImage(idx)}
                                className="absolute top-1 right-1 bg-red-600/90 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                disabled={isPublishing}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                    <label className={`w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-gray-800/50 transition-colors ${isPublishing ? 'pointer-events-none opacity-50' : ''}`}>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleExtraImageChange}
                            className="hidden"
                            disabled={isPublishing}
                        />
                        <span className="text-2xl text-gray-500">+</span>
                        <span className="text-[10px] text-gray-500 font-bold uppercase mt-1">Add Photos</span>
                    </label>
                </div>
            </div>

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="w-full">
                    <input
                        type="text"
                        className={`${inputClass} text-4xl font-extrabold tracking-tight mb-2 h-16`}
                        placeholder={isDeveloper ? "Project Name" : "Property Title (e.g. 3BHK Apartment)"}
                        value={isDeveloper ? formData.projectName : formData.title}
                        onChange={(e) => handleChange(isDeveloper ? 'projectName' : 'title', e.target.value)}
                        disabled={isPublishing}
                    />

                    <div className="flex items-center gap-2 mt-4">
                        <FiMap className="text-gray-400 text-xl flex-shrink-0" />
                        <input
                            type="text"
                            className={`${inputClass} text-lg font-bold text-gray-400`}
                            placeholder="Location (City, Area)"
                            value={formData.location}
                            onChange={(e) => handleChange('location', e.target.value)}
                            disabled={isPublishing}
                        />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-4">
                        {/* Type Tag */}
                        <div className="flex flex-col w-40">
                            <label className={labelClass}>{isDeveloper ? 'Scheme Type' : 'Property Type'}</label>
                            <select
                                className="bg-gray-800 text-white rounded-lg p-2 text-sm font-bold border border-gray-700 outline-none"
                                value={isDeveloper ? formData.schemeType : formData.type}
                                onChange={(e) => handleChange(isDeveloper ? 'schemeType' : 'type', e.target.value)}
                                disabled={isPublishing}
                            >
                                <option value="">Select Type</option>
                                {isDeveloper ? (
                                    <>
                                        <option value="Residential">Residential</option>
                                        <option value="Commercial">Commercial</option>
                                        <option value="Mixed">Mixed Usage</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="Apartment">Apartment</option>
                                        <option value="House">House</option>
                                        <option value="Villa">Villa</option>
                                        <option value="Plot">Plot</option>
                                        <option value="Office">Office</option>
                                    </>
                                )}
                            </select>
                        </div>

                        {/* Status Tag */}
                        <div className="flex flex-col w-40">
                            <label className={labelClass}>Status</label>
                            <select
                                className="bg-gray-800 text-white rounded-lg p-2 text-sm font-bold border border-gray-700 outline-none"
                                value={formData.status}
                                onChange={(e) => handleChange('status', e.target.value)}
                                disabled={isPublishing}
                            >
                                <option value="">Status</option>
                                <option value="Ready to Move">Ready to Move</option>
                                <option value="Under Construction">Under Construction</option>
                                <option value="New Launch">New Launch</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Price & Stats */}
            <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 border border-gray-700 bg-gray-800/50 p-8 rounded-2xl shadow-xl flex flex-col justify-center">
                    <label className={labelClass}>Investment / Price</label>
                    {isDeveloper ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                className={`${inputClass} text-2xl font-black`}
                                placeholder="Min Price"
                                value={formData.basePrice}
                                onChange={(e) => handleChange('basePrice', e.target.value)}
                                disabled={isPublishing}
                            />
                            <span className="text-gray-400">-</span>
                            <input
                                type="text"
                                className={`${inputClass} text-2xl font-black`}
                                placeholder="Max Price"
                                value={formData.maxPrice}
                                onChange={(e) => handleChange('maxPrice', e.target.value)}
                                disabled={isPublishing}
                            />
                        </div>
                    ) : (
                        <input
                            type="text"
                            className={`${inputClass} text-3xl font-black`}
                            placeholder="Price (e.g., 75 Lacs)"
                            value={formData.price}
                            onChange={(e) => handleChange('price', e.target.value)}
                            disabled={isPublishing}
                        />
                    )}
                    <div className="mt-4">
                        <label className={labelClass}>{isDeveloper ? "Total Project Area" : "Built-up Area"}</label>
                        <input
                            type="text"
                            className={inputClass}
                            placeholder={isDeveloper ? "e.g. 5 Acres" : "e.g. 1500 sq ft"}
                            value={isDeveloper ? formData.projectStats.area : formData.area}
                            onChange={(e) => isDeveloper ? handleStatChange('area', e.target.value) : handleChange('area', e.target.value)}
                            disabled={isPublishing}
                        />
                    </div>
                </div>

                {isDeveloper ? (
                    <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {[
                            { label: 'Towers', field: 'towers', ph: '4' },
                            { label: 'Total Floors', field: 'floors', ph: '20' },
                            { label: 'Total Units', field: 'units', ph: '400' },
                        ].map((stat, i) => (
                            <div key={i} className="border border-gray-700 bg-gray-800/30 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                                <label className={labelClass}>{stat.label}</label>
                                <input
                                    type="text"
                                    className={`${inputClass} text-center font-bold text-xl`}
                                    placeholder={stat.ph}
                                    value={formData.projectStats[stat.field]}
                                    onChange={(e) => handleStatChange(stat.field, e.target.value)}
                                    disabled={isPublishing}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {[
                            { label: 'Bedrooms (BHK)', field: 'bhk', ph: 'e.g. 3' },
                            { label: 'Bathrooms', field: 'bathrooms', ph: 'e.g. 2' },
                            { label: 'Furnishing', field: 'furnishing', ph: 'Semi/Full' },
                        ].map((stat, i) => (
                            <div key={i} className="border border-gray-700 bg-gray-800/30 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                                <label className={labelClass}>{stat.label}</label>
                                <input
                                    type="text"
                                    className={`${inputClass} text-center font-bold text-xl`}
                                    placeholder={stat.ph}
                                    value={formData[stat.field]}
                                    onChange={(e) => handleChange(stat.field, e.target.value)}
                                    disabled={isPublishing}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Compliance / Status / Amenities */}
            <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <h2 className="text-2xl font-extrabold">{isDeveloper ? 'Compliance & Details' : 'Details'}</h2>
                    <div className="border border-gray-700 bg-gray-800/30 p-6 rounded-2xl space-y-4">
                        {isDeveloper && (
                            <>
                                <div className="flex items-center justify-between py-2 border-b border-gray-700">
                                    <span className="text-gray-400 font-bold">RERA Status</span>
                                    <select
                                        className="bg-transparent text-white font-bold outline-none border-b border-gray-600"
                                        value={formData.reraStatus}
                                        onChange={(e) => handleChange('reraStatus', e.target.value)}
                                        disabled={isPublishing}
                                    >
                                        <option value="No">No</option>
                                        <option value="Yes">Registered</option>
                                    </select>
                                </div>
                                {formData.reraStatus === 'Yes' && (
                                    <div className="flex flex-col gap-1 py-1">
                                        <label className={labelClass}>RERA ID</label>
                                        <input
                                            className={inputClass}
                                            placeholder="Enter RERA Number"
                                            value={formData.reraNumber}
                                            onChange={(e) => handleChange('reraNumber', e.target.value)}
                                            disabled={isPublishing}
                                        />
                                    </div>
                                )}
                                <div className="flex flex-col gap-1 py-2">
                                    <label className={labelClass}>Possession Date</label>
                                    <input
                                        type="date"
                                        className={inputClass}
                                        value={formData.possessionDate}
                                        onChange={(e) => handleChange('possessionDate', e.target.value)}
                                        disabled={isPublishing}
                                    />
                                </div>
                            </>
                        )}

                        <div className="flex flex-col gap-2 pt-2">
                            <label className={labelClass}>
                                {isDeveloper ? 'Project Amenities (Comma Separated)' : 'Amenities / Facilities (Comma Separated)'}
                            </label>
                            <textarea
                                className={`${inputClass} h-24 bg-gray-900/50 p-2 rounded-lg`}
                                placeholder="E.g. Pool, Gym, Club House, 24x7 Security..."
                                value={formData.facilities}
                                onChange={(e) => handleChange('facilities', e.target.value)}
                                disabled={isPublishing}
                            />
                        </div>

                        {/* Developer Option Lists */}
                        {isDeveloper && (
                            <>
                                <div className="flex flex-col gap-2 pt-2">
                                    <label className={labelClass}>Residential Options (e.g. 2BHK, 3BHK)</label>
                                    <input
                                        className={inputClass}
                                        placeholder="Comma separated: 2BHK, 3BHK, Penthouse"
                                        value={formData.residentialOptions}
                                        onChange={(e) => handleChange('residentialOptions', e.target.value)}
                                        disabled={isPublishing}
                                    />
                                </div>
                                <div className="flex flex-col gap-2 pt-2">
                                    <label className={labelClass}>Commercial Options</label>
                                    <input
                                        className={inputClass}
                                        placeholder="Comma separated: Shops, Showrooms"
                                        value={formData.commercialOptions}
                                        onChange={(e) => handleChange('commercialOptions', e.target.value)}
                                        disabled={isPublishing}
                                    />
                                </div>
                            </>
                        )}

                    </div>
                </div>

                {/* Description */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-extrabold">About Property</h2>
                    <textarea
                        className={`w-full h-[300px] bg-gray-800/30 border border-gray-700 rounded-2xl p-6 text-gray-300 leading-relaxed text-lg focus:border-blue-500 outline-none`}
                        placeholder="Write a detailed description of the property/project here..."
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        disabled={isPublishing}
                    />
                </div>
            </div>

            {/* Contact Info */}
            <div className="mt-16 bg-gradient-to-r from-gray-900 to-black p-8 rounded-3xl border border-gray-700 shadow-2xl">
                <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] mb-6">Contact Information</h2>
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1">
                        <label className={labelClass}>{isDeveloper ? 'Developer / Company Name' : 'Owner Name'}</label>
                        <input
                            className={`${inputClass} text-2xl font-black mb-4`}
                            placeholder={isDeveloper ? "Company Name" : "Your Name"}
                            value={isDeveloper ? formData.developerName : formData.ownerName}
                            onChange={(e) => handleChange(isDeveloper ? 'developerName' : 'ownerName', e.target.value)}
                            disabled={isPublishing}
                        />
                    </div>
                    <div className="flex-1 space-y-4">
                        <div>
                            <label className={labelClass}>Phone Number</label>
                            <input
                                className={`${inputClass} text-xl`}
                                placeholder="10-digit number"
                                value={formData.contactPhone}
                                onChange={(e) => handleChange('contactPhone', e.target.value)}
                                disabled={isPublishing}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Email Address</label>
                            <input
                                className={`${inputClass} text-lg`}
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                disabled={isPublishing}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Action Buttons */}
            <div className="mt-10 pt-6 border-t border-gray-800 flex justify-end gap-4">
                <button
                    onClick={onCancel}
                    className="px-6 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-medium transition-colors"
                    disabled={isPublishing}
                >
                    Cancel
                </button>
                <button
                    onClick={handlePost}
                    className="px-6 py-2 rounded-lg bg-white text-black hover:bg-gray-200 font-bold transition-colors"
                    disabled={isPublishing}
                >
                    Publish
                </button>
            </div>

        </div>
    );
};

export default PropertyTemplateEditor;
