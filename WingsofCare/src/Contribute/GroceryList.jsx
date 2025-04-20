import React, { useEffect } from 'react';
import { useState } from 'react';
import {Link} from 'react-router-dom';
import axios from 'axios';
const GroceryList = () => {
    const [users,setUsers]=useState([])
    useEffect(()=>{
        console.log("its is working");
        axios.get('http://localhost:3001')  
        .then(result =>{ console.log("Data received:", result.data);
            setUsers(result.data);})
        .catch(err =>console.log(err))
    },[])
    return (
        <div className="d-flex vh-100 bg-primary justify-content-center align-items-center">
            <div className="w-50 bg-white rounded p-3">
                <Link to="/create" className="btn btn-success">Add +</Link>
                <table className='table'>
                    <thead>
                        <tr>
                        <th>Id</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                      {
                         users.map((user) =>{
                return(
                            <tr key={user._id}>
                             <td>{user.id}</td>
                            <td>{user.name}</td>
                            <td>{user.price}</td>
                            <td>{user.quantity}</td>
                            <td>
                                
                                <Link to={`/update/${user._id}`} className='btn btn-success'>Update</Link>
                                <button className='btn btn-danger'>Delete</button>
                            </td>
                            </tr>
                         )})
                      }
                    </tbody>
                </table>
            </div>
         
        </div>
    );
}

export default GroceryList;
