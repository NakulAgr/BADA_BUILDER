import React from 'react';

const Investments = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-4">
     

      {/* Hero Section */}
      <div className="text-center mt-28 max-w-3xl">
        <h1 className="text-4xl font-bold text-blue-800 mb-2">Page Coming Soon</h1>
        <div className="h-1 w-48 bg-blue-600 mx-auto my-4 rounded"></div>
        <p className="text-lg text-gray-700 mb-6">
          We are building it and will come with this page soon.
        </p>
        <img 
          src="/coming-soon-banner.png" // replace with actual path
          alt="Coming Soon Illustration"
          className="w-full max-w-xl rounded shadow"
        />
      </div>
    </div>
  );
};



export default Investments;
