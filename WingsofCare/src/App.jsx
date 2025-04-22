import React from 'react';
import { BrowserRouter, Routes, Route, Link, Outlet } from 'react-router-dom';
import GroceryList from './Contribute/GroceryList'; // Your existing component
import AddItem from './Contribute/AddItem'; // Your existing component
import UpdateItem from './Contribute/updateList'; // Assuming you have this component
import Home from './Home/Home'; 
import Contribute from './Home/Contribute';
import SponsorChild from './Contribute/SponsorChild';
import Provisions from './Contribute/Provisions';
import Profile from './Home/Profile';
import 'bootstrap/dist/css/bootstrap.min.css';
function App() {
  return (
    <BrowserRouter>
      <div className="app">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">Wings of Care</Link>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav" 
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/contribute">Contribute</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/profile">Profile</Link>

            </li>
            
          </ul>
        </div>
      </div>
    </nav>

        <div className="container mt-4">
          
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/contribute" element={<Contribute />} />
            <Route path="/contribute/grocery" element={<GroceryList />} />
            <Route path="/contribute/grocery/create" element={<AddItem />} />
            <Route path="/contribute/grocery/update/:id" element={<UpdateItem />} />
            <Route path="/contribute/sponsor" element={<SponsorChild />} />
            <Route path="/contribute/provisions" element={<Provisions />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
          
        </div>
      </div>
    </BrowserRouter>
);
}

export default App;