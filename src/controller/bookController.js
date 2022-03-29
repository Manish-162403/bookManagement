//const userModel = require('../models/userModel')
const bookModel = require('../models/bookModel')
const mongoose = require('mongoose')



const isValidObjectId = function(objectId) {
    return mongoose.Types.ObjectId.isValid(objectId.trim())
  }

const isValid = function (value) {
    if (typeof value == undefined || value == null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}
const isValidRequestBody = function(requestBody){
    return Object.keys(requestBody).length>0 
}
const isValidDate = (date) => {
    const specificDate =new Date(date);
    const today = new Date();
    return specificDate<today;
}

//////////////////////////// creatre book /////////////////////////////////////////////////////////////


const createBook = async function(req, res){
    try{
        const data = req.body
        const query = req.query

        const {title,excerpt,userId,ISBN,category,subcategory,reviews,releasedAt} = data


    if(isValidRequestBody(query)){
        return res.status(400).send({status:false,message:'This operation is not allowed'})
    }
    if(!isValidRequestBody(data)){
        return res.status(400).send({status:false, message:'Please insert valid data'})
    }
       

    // vaidations for data
    if(!isValidDate(releasedAt)){
        return res.status(400).send({status:false,message:'Released date can not be greater than today'})
    }
    if(!isValid(title)){
        return res.status(400).send({status:false,message:'title is required'})
    }
    if(!isValid(excerpt)){
        return res.status(400).send({status:false,message:'excerpt is reuired'})
    }
    if(!isValid(userId)){
        return res.status(400).send({status:false,message:'userId is required'})
    }

    if (!isValidObjectId(userId)) {
        return  res.status(400).send({ status: false, message: 'You Are Providing Invalid userId' });
        
    }/////
    
    if(!isValid(ISBN)){
        return res.status(400).send({status:false,message:'ISBN is required'})
    }
    if(!isValid(category)){
        return res.status(400).send({status:false,message:'category is required'})
    }
    if(!isValid(subcategory)){
        return res.status(400).send({status:false,message:'subcategory is required'})
    }
 
    if(!(/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/.test(data.ISBN.trim()))){
        return res.status(400).send({status:false, message: "ISBN is not valid"})
    }

    if (!(/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/.test(data.releasedAt.trim()))) {
        return res.status(400).send({ status: false, message: 'not invalid format, please enter date in YYYY-MM-DD format' })
            }

    // for dublicate data

    const duplicateTitle = await bookModel.findOne({title})
    if(duplicateTitle){
        return res.status(400).send({status:false, message:'This title already exist'})
    }
    
    const duplicateISBN = await bookModel.findOne({ISBN})
    if(duplicateISBN){
        return res.status(400).send({status: false, message:'ISBN already exist'})
    }

    const bookBody = {
        title,
        excerpt,
        userId,
        ISBN,
        category,
        subcategory,
        reviews,
        releasedAt
    };
    let savedBook = await bookModel.create(bookBody)
    return res.status(201).send({status:true, message :savedBook})

    }
    catch(err){
        return res.status(500).send({status:false, message : err.message})
    }
}


///////////////////////////////////bet books//////////////////////////////////////////////////////////////////

const getBook = async function (req, res) {
    try {
        const data = req.body
         const query = req.query
        const filter = { isDeleted: false }
        if (isValidRequestBody(data)) {
            return res.status(400).send({ status: false, message: 'this is not allowed' })
        }
        

        if (isValidRequestBody(query)) {
            const { userId, category, subcategory } = query

            if (!isValidObjectId(userId)) {
                return  res.status(400).send({ status: false, message: 'You Are Providing Invalid userId' });
                
            }

            if (isValid(userId)) {
                const userid = await bookModel.find({ userId })
                if (userid) { filter['userId'] = userId }
            }

            if (isValid(category)) {
                const cateogrised = await bookModel.find({ category })
                if (cateogrised) { filter['category'] = category }
            }
            if (isValid(subcategory)) {
                const subcat = await bookModel.find({ subcategory })
                if (subcat) { filter['subcategory'] = subcategory }

            }

        }
        // 

        const books = await bookModel.find(filter)
            .select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, reviews: 1, releasedAt: 1 })

        if (books.length === 0) {
            return res.status(400).send({ status: false, message: 'No Books found' })
        }

        const allbook = books.sort(function (a, b) { return a.title.toLowerCase() > b.title.toLowerCase() ? 1 : -1 })
     
        return res.status(200).send({ status: true, message: allbook })


    }

    catch (err) { return res.status(500).send({ status: false, message: err.message }) }
}



  //// get book by id //////////////////////////////////////////////////////////////////


  const bookById = async function (req, res) {
    try {
        let bookId = req.params.bookId;
        const book = await bookModel
            .findOne({ _id: bookId, isDeleted: false })
            .select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, reviews: 1, releasedAt: 1, reviewsData: [] });

        if (!book) {
            return res.status(400).send({ status: false, message: "Book you are looking for has already been deleted" })
        }


        return res.status(200).send({ status: true, message: book })

    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const updateBook = async function (req, res) {
    try {
  
      let bookId = req.params.bookId

      
      let data = req.body
  let filter = {}


  if (!isValidObjectId(bookId)) {
    return  res.status(400).send({ status: false, message: 'You Are Providing Invalid bookId' });
    
}  
      let bookToBeModified = await bookModel.findById(bookId)
      if (bookToBeModified) {
  

  
          if (Object.keys(data) != 0) {
  
            if (bookToBeModified.isDeleted == false) {

        const checkDuplicateTitle = await bookModel.findOne({title: data.title})
        if(checkDuplicateTitle){return res.status(400).send({status: false,ERROR: "title already exist"})}

        const checkDuplicateExcerpt = await bookModel.findOne({excerpt: data.excerpt})
        if(checkDuplicateExcerpt){return res.status(400).send({status: false,ERROR: "excerpt already exist"})}

        
        const checkDuplicateReleasedAt = await bookModel.findOne({releasedAt: data.releasedAt})
        if(checkDuplicateReleasedAt){return res.status(400).send({status: false,ERROR: "releasedAt already exist"})}

        const checkDuplicateISBN = await bookModel.findOne({ISBN: data.ISBN})
        if(checkDuplicateISBN){return res.status(400).send({status: false,ERROR: "ISBN already exist"})}
  
              if (isValid(data.title)) { filter['title'] = data.title }
              if (isValid(data.excerpt)) { filter['excerpt'] = data.excerpt }
              if (isValid(data.releasedAt)) { filter['releasedAt'] = data.releasedAt }
              if (isValid(data.ISBN)) { filter['ISBN'] = data.ISBN }
               
            
                
              let updatedBook = await bookModel
              .findOneAndUpdate({ _id: bookId }, { title:data.title,excerpt:data.excerpt,releasedAt:data.releasedAt, ISBN:data.ISBN},
                 { new: true })
  
              return res.status(202).send({ Status: "Book updated successfully", message:updatedBook })
  
            }
            else {
              return res.status(400).send({ status: false, message: "Book requested has been deleted" })
            }
          }
          else {
            return res.status(400).send({ status: false, message: "Bad Request" })
          }
  
  
      } else { return res.status(404).send({ status:false, message: "Book not found" }) }
    }
  
    catch (err) {
      return res.status(500).send({ message: err.message })
    }
  
  }


  ///////////////////////////////////////////////////////////////////////////////////

  let deleteBookById = async function (req, res) {

    try {
      let id = req.params.bookId
  
      if (!isValidObjectId(id)) {
        return  res.status(400).send({ status: false, message: 'You Are Providing Invalid bookId' });
        
    }   

      if (id) {
        let blogToBeDeleted = await bookModel.findById(id)
  
        if (blogToBeDeleted.isDeleted == true) { return res.status(400).send({ status: false, message: "Book has already been deleted" }) }
     
        
  
            let deletedBlog = await bookModel.findOneAndUpdate({ _id: id },
              { $set: { isDeleted: true, deletedAt: Date.now() } })
  
            return res.status(200).send({ Status:true, message: "Requested book has been deleted." })
   
      } else { return res.status(400).send({status:false, message: 'BAD REQUEST' }) }
  
  
    }
    catch (err) { return res.status(500).send({ ERROR: err.message }) }
  
  
  }



module.exports.createBook = createBook
module.exports.getBook = getBook
module.exports.bookById = bookById
module.exports.updateBook= updateBook
module.exports.deleteBookById= deleteBookById
