const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId

const bookSchema = new mongoose.Schema({


    title: {
        type:String, 
        required:true,
        unique:true,
        trim:true
    },

    excerpt: {
        type: String,
        required:true,
        trim:true
    }, 

    userId: {
        type:ObjectId,
        trim:true,
        required:true,
        ref: 'createUser'
    },

    ISBN: {
        type:String,
        trim:true,
        required:true,
        unique:true
    },

    category: {
        type:String,
        required:true,
        trim:true
    },

    subcategory: {
        type:String,  
        required:true,
        trim:true

    },

    reviews: {
        type:Number,
        default: 0,
      
    },
    deletedAt: {
        type:Date
    }, 

    isDeleted: {
        type: Boolean,
        default: false
    },
    
    releasedAt: {
        type:Date,
        required:true,
        trim:true
        
    }


},{timestamps:true})


  module.exports = mongoose.model('createBook', bookSchema)