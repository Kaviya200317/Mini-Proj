const express  =require('express')
const mongoose =require('mongoose')
const cors=require('cors')
const UserModel=require('./models/GroceryList')

const app=express()
app.use(cors())
app.use(express.json())

mongoose.connect("mongodb://127.0.0.1:27017/Wings")
app.get('/',(req,res) =>{
    UserModel.find({})
        .then(grocerylists =>{
            res.json(grocerylists)})
    .catch(err =>res.json(err))
})

app.get('/getGroceryList/:id',(req,res) =>{
    const id=req.params.id;
    UserModel.findById(id)
    .then(grocerylists =>{
        res.json(grocerylists)})
.catch(err =>res.json(err))

})

app.put('/updateList/:id',(req,res)=>{
    const id=req.params.id;
    UserModel.findByIdAndUpdate(id,{
        name:req.body.name,
        price:req.body.price,
        quantity:req.body.quantity}, { new: true })
    .then(users =>res.json(users ))
    .catch(err =>res.json(err))
})


app.delete('/deleteItem/:id',(req,res) =>{
    const id=req.params.id;
    UserModel.findByIdAndDelete({_id:id})
    .then(res=>res.json(res))
    .catch(err=>res.json(err))
})


app.post("/addItem",(req,res)=>{
    UserModel.create(req.body)
    .then(users =>res.json(users ))
    .catch(err =>res.json(err))
})



app.listen(3001, ()=>{
    console.log("Server is  running")
})