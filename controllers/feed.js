const {validationResult}=require('express-validator');
const Post=require('../models/post');
const fs=require('fs');
const path = require('path');
const User = require('../models/user');
exports.getPosts = async (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;
    try {
        console.log('heress');
      const totalItems = await Post.find().countDocuments();
      const posts = await Post.find()
        
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
  
      res.status(200).json({
        message: 'Fetched posts successfully.',
        posts: posts,
        totalItems: totalItems
      });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  };

exports.createPost= async (req, res, next) => {
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        const error=new Error('Validation failed, entered data is incorrect.');
        error.statusCode=422;
        throw error;
    }
    if (!req.file) {
        const error = new Error('No image provided.');
        error.statusCode = 422;
        throw error;
    }
    const imageUrl = req.file.path;
    const title=req.body.title;
    const content=req.body.content;
    let creator;
    const post=new Post({
        title:title,
        content:content,
        imageUrl: imageUrl,
        creator: req.userId,
    });
    try{
    console.log ("in try");
    await post.save();
    const user=await User.findById(req.userId);
    user.posts.push(post);
    await user.save();
    res.status(201).json({
        message:'Post created successfully!',
        post:post,
        creator:{_id:user._id, name:user.name}
    });
    }
    catch(err){
        if(!err.statusCode){
            err.statusCode=500;
        }
        next(err);
    }
}
exports.getPost=async (req, res, next) => {
    const postId=req.params.postId;
    try{
        console.log('inside my 2nd try');
        const post = await Post.findById(postId)
        post.imageUrl = post.imageUrl.replace(/\\/g, "/");
        res.status(200).json({message:'Post fetched.', post:post});
        if(!post){
                const error=new Error('Could not find post.');
                error.statusCode=404;
                throw error;
        }
    }
    catch(err){
        if(!err.statusCode){
            err.statusCode=500;
        }
        next(err);
    }
}

exports.updatePost = async (req, res, next) => {
    const postId=req.params.postId;
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        const error=new Error('Validation failed, entered data is incorrect.');
        error.statusCode=422;
        throw error;
    }
    const title=req.body.title;
    const content=req.body.content;
    // if the user didn't provide an image, use the old one
    let imageUrl=req.body.image;
    if(req.file){
        imageUrl=req.file.path;
    }
    if(!imageUrl){
        const error=new Error('No file picked.');
        error.statusCode=422;
        throw error;
    }
    try{
        console.log('in my edit try');
        const post = await Post.findById(postId)
        if(!post){
            const error=new Error('Could not find post.');
            error.statusCode=404;
            throw error;
        }
        if(post.creator.toString()!==req.userId){
            const error=new Error('Not authorized!');
            error.statusCode=403;
            throw error;
        }
        if (imageUrl !== post.imageUrl) {
            clearImage(post.imageUrl);
        }
        post.title=title;
        post.content=content;
        post.imageUrl=imageUrl;
        const result = await post.save();
        res.status(200).json({message:'Post updated successfully!', post:result});
        

    }
    catch (err) {
        if(!err.statusCode){
            err.statusCode=500;
        }
        next(err);
    }
}

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
}


exports.deletePost = async (req, res, next) => {
    const postId=req.params.postId;
    const post = await Post.findById(postId)
    try{
        console.log('in my delete try');
        if(!post){
            const error=new Error('Could not find post.');
            error.statusCode=404;
            throw error;
        }
        
        if(post.creator.toString()!==req.userId){
            const error=new Error('Not authorized!');
            error.statusCode=403;
            throw error;
        }
        // Check logged in user
        clearImage(post.imageUrl);
        await Post.findByIdAndRemove(postId);
        const user = await User.findById(req.userId);
        user.posts.pull(postId);
        await user.save();
        res.status(200).json({message:'Post deleted successfully!'});
    }
    catch (err) {
        if(!err.statusCode){
            err.statusCode=500;
        }
        next(err);

    }
} 