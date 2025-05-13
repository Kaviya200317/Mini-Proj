import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext'; // Make sure this path is correct

const Contribute = () => {
  const { currentUser } = useAuth();

  // Redirect or show message if user is not logged in
  // if (!currentUser) {
  //   return (
  //     <div>
  //       <h1>Access Restricted</h1>
  //       <p>Please login to access contribution options.</p>
  //       <Link to="/login" className="btn btn-primary mt-3">
  //         Login
  //       </Link>
  //     </div>
  //   );
  // }

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
        
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Grocery List</h5>
              <p className="card-text">Help with grocery supplies for our programs.</p>
              <Link to="/contribute/grocery" className="btn btn-primary">Manage Grocery List</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contribute;