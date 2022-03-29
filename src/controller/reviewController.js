const reviewModel = require("../models/reviewModel")
const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId


const createReview = async function (req,res){
     let data = req.body


     
    const review = await reviewModel.create(data)

    return res.status(201).send({status: true, message: review})

}


module.exports.createReview=createReview