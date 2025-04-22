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

    const handleDelete =(id)=>{
        axios.delete('http://localhost:3001/deleteItem/'+id)
        .then(res=> {console.log(res)
            window.location.reload()})
        .catch(errr =>console.log(errr))
    }
    return (
        <div className="d-flex vh-100 bg-primary justify-content-center align-items-center">
            <div className="w-50 bg-white rounded p-3">
                <Link to="/contribute/grocery/create" className="btn btn-success">Add +</Link>
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
                            <tr key={user.id}>
                             <td>{user.id}</td>
                            <td>{user.name}</td>
                            <td>{user.price}</td>
                            <td>{user.quantity}</td>
                            <td>
                                
                                <Link to={`/contribute/grocery/update/${user._id}`} className='btn btn-success'>Update</Link>
                                <button className='btn btn-danger' onClick={(e)=>{
                                    handleDelete(user._id) }}>Delete</button>
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
