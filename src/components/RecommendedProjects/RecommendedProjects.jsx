import React from 'react';
import './RecommendedProjects.css';
import { Link } from 'react-router-dom';
import listings from '../../data/listings';

const RecommendedProjects = () => {
  return (
    <section className="recommended-section">
      <h2>Recommended Projects</h2>

      <div className="recommended-grid">
        {listings.slice(0, 2).map((project, idx) => (
          <div className="recommended-card" key={project.id}>
            <img src={project.image} alt={project.title} />
            <div className="recommended-info">
              {project.tags?.length > 0 && (
                <span className="tag">{project.tags[0]}</span>
              )}
              <h3>{project.title}</h3>
              <p>{project.area} – {project.bhk}</p>
              <strong>{project.price}</strong>
            </div>
          </div>
        ))}
      </div>

      <div className="view-all-wrapper">
        <Link to="/projects" className="view-all-btn">
          View All Projects
        </Link>
      </div>
    </section>
  );
};

export default RecommendedProjects;
