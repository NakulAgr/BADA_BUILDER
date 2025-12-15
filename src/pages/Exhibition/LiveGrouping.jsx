import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './Exhibition.css';
import './LiveGrouping.css';

const LiveGrouping = () => {
  const [selectedGroup, setSelectedGroup] = useState(null);

  const liveGroups = [
    {
      id: 1,
      title: "Skyline Towers - Group Buy",
      developer: "Shree Balaji Builders",
      location: "Waghodia Road, Vadodara",
      originalPrice: "₹75 Lakhs",
      groupPrice: "₹68 Lakhs",
      discount: "9% OFF",
      image: "/placeholder-property.jpg",
      type: "3 BHK Apartment",
      totalSlots: 20,
      filledSlots: 14,
      timeLeft: "2 Days 5 Hours",
      minBuyers: 15,
      benefits: ["Free Modular Kitchen", "2 Years Maintenance Free", "Premium Flooring"],
      status: "active"
    },
    {
      id: 2,
      title: "Green Valley Phase 2",
      developer: "Prestige Group",
      location: "Manjalpur, Vadodara",
      originalPrice: "₹85 Lakhs",
      groupPrice: "₹76 Lakhs",
      discount: "11% OFF",
      image: "/placeholder-property.jpg",
      type: "4 BHK Villa",
      totalSlots: 15,
      filledSlots: 15,
      timeLeft: "Closing Soon",
      minBuyers: 10,
      benefits: ["Free Club Membership", "Landscaped Garden", "Solar Panels"],
      status: "closing"
    },
    {
      id: 3,
      title: "Royal Heights Premium",
      developer: "Kalpataru Developers",
      location: "Akota, Vadodara",
      originalPrice: "₹1.2 Cr",
      groupPrice: "₹1.05 Cr",
      discount: "12% OFF",
      image: "/placeholder-property.jpg",
      type: "Luxury Penthouse",
      totalSlots: 10,
      filledSlots: 6,
      timeLeft: "5 Days 12 Hours",
      minBuyers: 8,
      benefits: ["Private Terrace", "Smart Home System", "Concierge Service"],
      status: "active"
    }
  ];

  const handleJoinGroup = (group) => {
    setSelectedGroup(group);
    // In production, this would open a modal or redirect to registration
    alert(`Joining group for ${group.title}!\n\nYou'll save ${group.discount} by joining this group buy.`);
  };

  const getProgressPercentage = (filled, total) => {
    return (filled / total) * 100;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return '#16a34a';
      case 'closing':
        return '#f59e0b';
      case 'closed':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="exhibition-page live-grouping-page">
      <div className="exhibition-container">
        {/* Header */}
        <motion.div 
          className="exhibition-header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="live-badge">🔴 LIVE</div>
          <h1>Live Group Buying</h1>
          <p>Join with other buyers and save up to 15% on premium properties</p>
          <div className="badge-container">
            <span className="info-badge">💰 Better Prices</span>
            <span className="info-badge">🤝 Group Benefits</span>
            <span className="info-badge">⚡ Limited Time</span>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div 
          className="exhibition-tabs"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link to="/exhibition/individual" className="tab">
            By Individual
          </Link>
          <Link to="/exhibition/developer" className="tab">
            By Developer
          </Link>
          <Link to="/exhibition/live-grouping" className="tab active">
            🔴 Live Grouping
          </Link>
          <Link to="/exhibition/badabuilder" className="tab">
            By Bada Builder
          </Link>
        </motion.div>

        {/* How It Works Section */}
        <motion.div 
          className="how-it-works"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2>How Group Buying Works</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Choose a Group</h3>
              <p>Select from active group buying opportunities</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Join & Pay Token</h3>
              <p>Pay a small token amount to secure your spot</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Wait for Group</h3>
              <p>Group activates when minimum buyers join</p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3>Get Discount</h3>
              <p>Enjoy group discount and exclusive benefits</p>
            </div>
          </div>
        </motion.div>

        {/* Live Groups Grid */}
        <div className="properties-grid">
          {liveGroups.map((group, index) => (
            <motion.div
              key={group.id}
              className={`property-card live-group-card ${group.status}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
            >
              <div className="property-image">
                <img src={group.image} alt={group.title} />
                <div className="property-badge live">🔴 Live Group</div>
                <div className="discount-badge">{group.discount}</div>
                <div className="timer-badge">⏰ {group.timeLeft}</div>
              </div>

              <div className="property-info">
                <h3>{group.title}</h3>
                <p className="owner">🏢 {group.developer}</p>
                <p className="location">📍 {group.location}</p>
                <p className="type-info">{group.type}</p>

                {/* Progress Bar */}
                <div className="group-progress">
                  <div className="progress-header">
                    <span className="progress-label">
                      {group.filledSlots}/{group.totalSlots} Buyers Joined
                    </span>
                    <span className="min-buyers">Min: {group.minBuyers}</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${getProgressPercentage(group.filledSlots, group.totalSlots)}%`,
                        backgroundColor: getStatusColor(group.status)
                      }}
                    />
                  </div>
                </div>

                {/* Pricing */}
                <div className="pricing-section">
                  <div className="price-comparison">
                    <div className="original-price">
                      <span className="label">Regular Price</span>
                      <span className="amount strikethrough">{group.originalPrice}</span>
                    </div>
                    <div className="group-price">
                      <span className="label">Group Price</span>
                      <span className="amount">{group.groupPrice}</span>
                    </div>
                  </div>
                  <div className="savings">
                    You Save: ₹{parseInt(group.originalPrice.replace(/[^0-9]/g, '')) - parseInt(group.groupPrice.replace(/[^0-9]/g, ''))} Lakhs
                  </div>
                </div>

                {/* Benefits */}
                <div className="benefits-list">
                  <h4>Group Benefits:</h4>
                  <ul>
                    {group.benefits.map((benefit, idx) => (
                      <li key={idx}>✓ {benefit}</li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <button 
                  className={`join-group-btn ${group.status}`}
                  onClick={() => handleJoinGroup(group)}
                  disabled={group.status === 'closed'}
                >
                  {group.status === 'closing' ? '⚡ Join Now - Closing Soon!' : 
                   group.status === 'closed' ? '❌ Group Closed' : 
                   '🤝 Join This Group'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div 
          className="faq-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-card">
              <h3>❓ What is Group Buying?</h3>
              <p>Group buying allows multiple buyers to purchase properties together, getting bulk discounts and exclusive benefits from developers.</p>
            </div>
            <div className="faq-card">
              <h3>💰 How much can I save?</h3>
              <p>Savings range from 8% to 15% depending on the project and group size. Plus, you get exclusive benefits worth lakhs.</p>
            </div>
            <div className="faq-card">
              <h3>⏰ What if group doesn't fill?</h3>
              <p>If minimum buyers don't join within the time limit, your token amount is fully refunded within 7 days.</p>
            </div>
            <div className="faq-card">
              <h3>🔒 Is it safe?</h3>
              <p>Yes! All transactions are secure, and properties are verified. You get the same legal documentation as regular purchases.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LiveGrouping;
