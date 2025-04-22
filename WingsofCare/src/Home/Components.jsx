import React from 'react';
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import Home from './Home';
import Contribute from './Contribute';
import Profile from './Profile';

const Components = () => {
    return (
        <div>
             <BrowserRouter>
          <Routes>
            <Route path='/' element={<Home />}></Route>
            <Route path='/contribute' element={<Contribute />}></Route>
            <Route path='/profile' element={<Profile/>}></Route>
    
          </Routes>
          </BrowserRouter>
        </div>
    );
}

export default Components;
