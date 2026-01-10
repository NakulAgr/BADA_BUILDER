import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { FaClipboardList, FaClock, FaCheckCircle, FaMapMarkerAlt, FaCalendarAlt, FaTrash, FaEye, FaExclamationTriangle } from 'react-icons/fa';
import './MyComplaints.css';

const MyComplaints = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, ongoing, fulfilled
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        alert('Please login to view your complaints');
        navigate('/login');
        return;
      }

      const complaintsRef = collection(db, 'complaints');
      const q = query(
        complaintsRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const complaintsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setComplaints(complaintsData);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      alert('Failed to load complaints. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (complaintId, docId) => {
    if (!window.confirm(`Are you sure you want to delete complaint ${complaintId}? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'complaints', docId));
      setComplaints(complaints.filter(c => c.id !== docId));
      alert('Complaint deleted successfully');
    } catch (error) {
      console.error('Error deleting complaint:', error);
      alert('Failed to delete complaint. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted': return 'status-submitted';
      case 'Under Review': return 'status-review';
      case 'In Progress': return 'status-progress';
      case 'Resolved': return 'status-resolved';
      case 'Rejected': return 'status-rejected';
      default: return '';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-GB');
  };

  const filteredComplaints = complaints.filter(complaint => {
    if (filter === 'all') return true;
    if (filter === 'ongoing') {
      return ['Submitted', 'Under Review', 'In Progress'].includes(complaint.status);
    }
    if (filter === 'fulfilled') {
      return ['Resolved', 'Rejected'].includes(complaint.status);
    }
    return true;
  });

  const stats = {
    total: complaints.length,
    ongoing: complaints.filter(c => ['Submitted', 'Under Review', 'In Progress'].includes(c.status)).length,
    resolved: complaints.filter(c => c.status === 'Resolved').length,
    rejected: complaints.filter(c => c.status === 'Rejected').length
  };

  return (
    <div className="my-complaints-page">
      <div className="my-complaints-container">
        {/* Header */}
        <div className="my-complaints-header">
          <div className="header-content">
            <h1>🏛️ My Civic Complaints</h1>
            <p>Track and manage all your registered complaints</p>
          </div>
          <button 
            className="register-new-complaint-btn"
            onClick={() => navigate('/register-complaint')}
          >
            <FaClipboardList /> Register New Complaint
          </button>
        </div>

        {/* Stats Cards */}
        <div className="complaints-stats">
          <div className="stat-card total">
            <div className="stat-icon">
              <FaClipboardList />
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.total}</span>
              <span className="stat-label">Total Complaints</span>
            </div>
          </div>
          <div className="stat-card ongoing">
            <div className="stat-icon">
              <FaClock />
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.ongoing}</span>
              <span className="stat-label">Ongoing</span>
            </div>
          </div>
          <div className="stat-card resolved">
            <div className="stat-icon">
              <FaCheckCircle />
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.resolved}</span>
              <span className="stat-label">Resolved</span>
            </div>
          </div>
          <div className="stat-card rejected">
            <div className="stat-icon">
              <FaExclamationTriangle />
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.rejected}</span>
              <span className="stat-label">Rejected</span>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({complaints.length})
          </button>
          <button
            className={`filter-tab ${filter === 'ongoing' ? 'active' : ''}`}
            onClick={() => setFilter('ongoing')}
          >
            Ongoing ({stats.ongoing})
          </button>
          <button
            className={`filter-tab ${filter === 'fulfilled' ? 'active' : ''}`}
            onClick={() => setFilter('fulfilled')}
          >
            Fulfilled ({stats.resolved + stats.rejected})
          </button>
        </div>

        {/* Complaints List */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner-large"></div>
            <p>Loading your complaints...</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="empty-state">
            <FaClipboardList className="empty-icon" />
            <h3>No Complaints Found</h3>
            <p>
              {filter === 'all' 
                ? "You haven't registered any complaints yet."
                : filter === 'ongoing'
                ? "You don't have any ongoing complaints."
                : "You don't have any fulfilled complaints."}
            </p>
            <button 
              className="register-new-btn"
              onClick={() => navigate('/register-complaint')}
            >
              Register Your First Complaint
            </button>
          </div>
        ) : (
          <div className="complaints-list">
            {filteredComplaints.map((complaint, index) => (
              <motion.div
                key={complaint.id}
                className="complaint-item"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div className="complaint-item-header">
                  <div className="complaint-id-section">
                    <span className="complaint-id-label">Complaint ID:</span>
                    <span className="complaint-id-value">{complaint.complaintId}</span>
                  </div>
                  <span className={`complaint-status ${getStatusColor(complaint.status)}`}>
                    {complaint.status}
                  </span>
                </div>

                <div className="complaint-item-body">
                  <h3 className="complaint-title">{complaint.title}</h3>
                  <p className="complaint-category">📂 {complaint.category}</p>
                  <p className="complaint-description">{complaint.description}</p>

                  <div className="complaint-meta-info">
                    <div className="meta-row">
                      <FaMapMarkerAlt className="meta-icon" />
                      <span>{complaint.address}, {complaint.pincode}</span>
                    </div>
                    <div className="meta-row">
                      <FaCalendarAlt className="meta-icon" />
                      <span>Submitted: {formatDate(complaint.createdAt)}</span>
                    </div>
                    {complaint.mediaUrls && complaint.mediaUrls.length > 0 && (
                      <div className="meta-row">
                        <span className="media-badge">
                          📷 {complaint.mediaUrls.length} attachments
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="complaint-item-actions">
                  <button 
                    className="action-btn view-btn"
                    onClick={() => {
                      // Future: Navigate to complaint details page
                      alert('Complaint details view coming soon!');
                    }}
                  >
                    <FaEye /> View Details
                  </button>
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(complaint.complaintId, complaint.id)}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyComplaints;
