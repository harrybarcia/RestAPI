const express=require('express');
const bodyParser=require('body-parser');
const feedRoutes=require('./routes/feed');
const cors=require('cors');
const mongoose=require('mongoose');
const { Result } = require('express-validator');
const app=express();
const path=require('path');
const multer=require('multer');
app.use(bodyParser.json());
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(cors());

const { v4: uuidv4 } = require('uuid');
     
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, uuidv4() + '-' + file.originalname);
    }
});
  
  const fileFilter = (req, file, cb) => {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };
// app.use((req,res,next)=>{
//     res.setHeader('Access-Control-Allow-Origin','*');
//     res.setHeader('Access-Control-Allow-Headers','Origin, X-Requested-With, Content-Type, Accept, Authorization');
//     res.setHeader('Access-Control-Allow-Methods','GET, POST, PATCH, DELETE, OPTIONS');
//     next();
// });

app.use(multer({storage:fileStorage,fileFilter:fileFilter}).single('image'));

app.use('/feed',feedRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Something went wrong';
    res.status(statusCode).json({ message: message });
})
mongoose.connect(
    'mongodb+srv://admin:doudou@cluster0.iaepn.mongodb.net/messages'

).then(result=>{
    app.listen(8080);
}).catch(err=>{
    console.log(err);       

});

