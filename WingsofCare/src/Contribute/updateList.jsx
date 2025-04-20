import React,{useState,useEffect} from 'react';
import { useParams,useNavigate } from 'react-router-dom';
import axios from 'axios'
const UpdateList = () => {
    const{id}=useParams()
    const [name,setName]= useState()
    const [price,setPrice]= useState()
    const [quantity,setQuantity]= useState()
    const [customId, setCustomId] = useState("")
    const navigate=useNavigate()

    useEffect(()=>{
        axios.get('http://localhost:3001/getGroceryList/'+id)  
        .then(result =>{console.log(result)
            setName(result.data.name)
            setPrice(result.data.price)
            setQuantity(result.data.quantity)
            setCustomId(result.data.id);
        })
        .catch(err =>console.log(err))
    },[])


const Update=(e)=>{
    e.preventDefault()
    console.log("Sending update for ID:", id)
    console.log("With data:", {name, price, quantity})
    
    axios.put("http://localhost:3001/updateList/"+id, {name, price, quantity})
        .then(result => {
            console.log("Update result:", result.data)
            navigate('/')
        })
        .catch(err => console.log("Update error:", err))
    }


    return ( 
        
            <div className="d-flex vh-100 bg-primary justify-content-center align-items-center">
            <div className="w-50 bg-white rounded p-3">
              <form onSubmit={Update}>
                <h2>Update Item</h2>
                <div className='mb-2'>
                    <label htmlFor=''>Id</label>
                    <input type="text" className='form-control' value={customId}></input>
                   
                </div>
                <div className='mb-2'>
                    <label htmlFor=''> Product Name</label>
                    <input type="text" className='form-control' value={name} onChange={(e)=>setName(e.target.value)}></input>
                </div>
                <div className='mb-2'>
                    <label htmlFor=''>Product Price</label>
                    <input type="text" className='form-control'value={price} onChange={(e)=>setPrice(e.target.value)} ></input>
                </div>
                <div className='mb-2'>
                    <label htmlFor=''>Product Quantity</label>
                    <input type="text" className='form-control'  value={quantity} onChange={(e)=>setQuantity(e.target.value)}></input>
                </div>
                <button className='btn btn-success justify-content-center align-items-center' >Submit</button>
                </form> 
               
               
               
             </div>
       </div>
        
    );
}

export default UpdateList;
