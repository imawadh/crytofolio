//table
const mongoose =require('mongoose');
require('mongoose-type-email');

const userSchema=new mongoose.Schema({
    first_name:{
        type:String,
        required:true,
        maxlength:50
    },
    last_name:{
        type:String,
        required:true,
        maxlength:50
    },
    age:{
        type:Number
    },
    mob:{
        type:Number
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        minlength:5,
        required:true
    }
});


//we have created the table now we will export this table


module.exports=mongoose.model('user',userSchema)
