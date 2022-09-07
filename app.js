const path=require('path');

const express=require('express');
const bodyParser=require('body-parser');
const cors=require('cors');
const mongoose=require('mongoose');
const {graphqlHTTP}=require('express-graphql');
const graphqlSchema=require('./graphql/schema');
const graphqlResolver=require('./graphql/resolvers');

const multer=require('multer');
// const feedRoutes=require('./routes/feed');
// const authRoutes=require('./routes/auth');
const auth=require('./middleware/auth');
const app=express();

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

app.use(auth);
app.use('/graphql', graphqlHTTP({
    schema:graphqlSchema,
    rootValue:graphqlResolver,
    graphiql:true,
    customFormatErrorFn(err){
        if(!err.originalError){
            return err;
        }
        const data=err.originalError.data;
        const message=err.message || 'An error occurred.';
        const code=err.originalError.code || 500;
        return {message:message, data:data, status:code};
    }
})
);

app.use(multer({storage:fileStorage,fileFilter:fileFilter}).single('image'));

// app.use('/feed',feedRoutes);
// app.use('/auth',authRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Something went wrong';
    const data=error.data;
    res.status(statusCode).json({ message: message, data: data });
})
mongoose.connect(
    'mongodb+srv://admin:doudou@cluster0.iaepn.mongodb.net/messages'

)  .then(result => {
  
  const server = app.listen(8080);

//   const socketio=require('socket.io')(server, {

//     cors: {
//         origin: '*',
//     }
// });


//   socketio.on('connection', socket => {
//     console.log('Client connected');
//   });
})
.catch(err => console.log(err));


