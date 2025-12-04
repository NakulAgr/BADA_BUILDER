import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import listings from '../data/listings';
import './ProjectDetails.css';
import balajiLogo from '../assets/balaji.png';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // ✅ Moved inside the component
  const project = listings.find(item => item.id === parseInt(id));

  if (!project) return <div className="text-center py-20">Listing not found</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {project.images?.slice(0, 6).map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`Project Image ${idx + 1}`}
              className="w-full h-68 object-cover rounded"
            />
          ))}
        </div>
        <div className="absolute text-white top-4 right-4">
          <button className="px-4 py-2 text-sm font-semibold rounded shadow">
            Download Brochure
          </button>
        </div>
      </div>

      {/* Title & Tags */}
      <div className="mt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="w-full md:w-auto text-left">
          <h1 className="text-3xl font-bold">{project.title}</h1>
          <p className="text-gray-400 font-bold">{project.location}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {project.tags?.map((tag, i) => {
              let tooltipText = null;

              if (tag === "RERA ✅") {
                tooltipText = "RERA Number: PR/GJ/VADODARA/VADODARA/Vadodara Municipal Corporation/RN348AA10248/080523";
              } else if (tag === "Under Construction") {
                tooltipText = "Construction Completion in Dec, 2025";
              }

              return tooltipText ? (
                <div key={i} className="relative group">
                  <span className="px-3 py-1 text-xs font-medium ui-bg text-white rounded-full cursor-pointer">
                    {tag}
                  </span>
                  <div className="absolute ui-bg z-10 w-72 p-2 text-xs font-bold text-white bg-black rounded shadow-lg top-full mt-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    {tooltipText}
                  </div>
                </div>
              ) : (
                <span key={i} className="px-3 py-1 text-xs font-medium ui-bg text-white rounded-full">
                  {tag}
                </span>
              );
            })}
          </div>
        </div>

        {/* Book a Site Visit Button */}
        <div className="mt-4 md:mt-0">
          <button
            onClick={() => navigate('/booksitevisit')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition duration-300"
          >
            Book a Site Visit
          </button>
        </div>
      </div>

      {/* Pricing */}
      <div className="mt-8 ui-bg p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Price Range</h2>
        <p className="text-2xl font-bold text-white">₹ {project.priceRange}</p>
        <p className="text-sm text-gray-400 mt-1">4 BHK Villa (1638 - 1796 sq.ft.)</p>
      </div>

      {/* Floor Plans */}
      <div className=" mt-10">
        <h2 className="text-xl font-semibold mb-4">Floor Plans & Pricing</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {project.floorPlans?.map((plan, idx) => (
            <div key={idx} className="ui-bg floor-plan-card rounded-lg shadow hover:shadow-lg transition overflow-hidden">
              <img src={plan.image} alt={`Plan ${idx + 1}`} className="w-full h-48 object-cover" />
              <div className="p-4">
                <p className="text-lg  font-medium">{plan.size} sq.ft. • 4 BHK</p>
                <p className="text-sm text-gray-400 mt-1">₹ {plan.price}</p>
                <p className="text-xs text-gray-400 mt-1">Possession: Dec ‘25</p>
                <button className="mt-3 w-full py-2 bg-blue-600 text-white rounded text-sm font-semibold">Request Callback</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seller Info */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">DEVELOPER</h2>
        <div className="p-4 ui-bg rounded-lg shadow flex items-center justify-between">
          <div>
            <p className="font-semibold text-lg">Shree Balaji Builders</p>
            <p className="text-sm text-gray-400">Builder</p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <img
              src={balajiLogo}
              alt="Shree Balaji Builders Logo"
              className="h-12 w-auto object-contain"
            />
          </div>
        </div>
      </div>

      {/* Facilities */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Top Facilities</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {project.facilities?.map((facility, idx) => (
            <div key={idx} className="p-3 ui-bg rounded-lg text-center text-sm font-medium">{facility}</div>
          ))}
        </div>
      </div>

      {/* Location Advantages */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Location Advantages</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {project.advantages?.map((item, idx) => (
            <div key={idx} className="ui-bg p-4 rounded-lg shadow">
              <p className="text-white font-bold">{item.place}</p>
              <p className="text-sm text-gray-500">{item.distance}</p>
            </div>
          ))}
        </div>
      </div>

      {/* More Info */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-2">More about {project.title}</h2>
        <p className="text-gray-400 leading-relaxed">{project.description}</p>
      </div>

      {/* Brochure 
      <div className="mt-10">
        <iframe
          src="/src/assets/brochures/Brochure.pdf#toolbar=0&navpanes=0&scrollbar=0"
          title="Brochure"
          width="100%"
          height="600"
          className="rounded shadow"
          style={{
            border: 'none',
            overflow: 'hidden',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        ></iframe>
      </div> */}



    </div>
  );
};

export default ProjectDetails;