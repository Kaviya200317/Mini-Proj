import React from 'react';
import { Link } from 'react-router-dom';

const Contribute = () => {
  return (
    <div>
      <h1>Contribute</h1>
      <p>Choose how you'd like to contribute:</p>
      
      <div className="row mt-4">
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Sponsor a Child</h5>
              <p className="card-text">Help support a child in need through our sponsorship program.</p>
              <Link to="/contribute/sponsor" className="btn btn-primary">Learn More</Link>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Provisions</h5>
              <p className="card-text">Contribute essential provisions and grocery items.</p>
              <Link to="/contribute/provisions" className="btn btn-primary">Manage Provisions</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contribute;