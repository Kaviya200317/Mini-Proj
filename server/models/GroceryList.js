    const mongoose=require('mongoose')
    const UserSchema=new mongoose.Schema({
        id: Number,
        name: String,
        price: Number,
        quantity: Number
    })

    const UserModel=mongoose.model("users",UserSchema)
    module.exports=UserModel