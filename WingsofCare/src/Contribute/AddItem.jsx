import React, { useState } from 'react';
import axios from 'axios'
import { useNavigate } from 'react-router-dom';

const AddItem = () => {
    const [id,setId]= useState()
    const [name,setName]= useState()
    const [price,setPrice]= useState()
    const [quantity,setQuantity]= useState()
    const navigate=useNavigate()


    const Submit = (e) => {
        e.preventDefault();
        axios.post("http://localhost:3001/addItem",{id,name,price,quantity})
        .then(result => {
            
            console.log(result)
            navigate('/contribute/grocery')
        })
        .catch(err =>console.log(err))
        }
    return (
        <div className="d-flex vh-100 bg-primary justify-content-center align-items-center">
            <div className="w-50 bg-white rounded p-3">
              <form onSubmit={Submit}>
                <h2>Add Item</h2>
                <div className='mb-2'>
                    <label htmlFor=''>Id</label>
                    <input type="text" className='form-control' onChange={(e)=>setId(e.target.value)}></input>
                   
                </div>
                <div className='mb-2'>
                    <label htmlFor=''> Product Name</label>
                    <input type="text" className='form-control'  onChange={(e)=>setName(e.target.value)}></input>
                </div>
                <div className='mb-2'>
                    <label htmlFor=''>Product Price</label>
                    <input type="text" className='form-control'  onChange={(e)=>setPrice(e.target.value)}></input>
                </div>
                <div className='mb-2'>
                    <label htmlFor=''>Product Quantity</label>
                    <input type="text" className='form-control'  onChange={(e)=>setQuantity(e.target.value)}></input>
                </div>
                <button className='btn btn-success justify-content-center align-items-center' >Submit</button>
                </form> 
               
               
               
             </div>
       </div>
    );
}

export default AddItem;
