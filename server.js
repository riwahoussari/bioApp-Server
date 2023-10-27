import 'dotenv/config'
import express from "express";
const app = express()
import mongoose from "mongoose";
import passport from 'passport';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import bodyParser from 'body-parser';
import User from './models/userModel.js';
//setup session and passport
app.use(session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    resave: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'none',
        secure: true,
        domain: 'bioclock.onrender.com',
        path: '/'
    },
    store: MongoStore.create({mongoUrl: process.env.MONGO_URL})
}))  
app.use(passport.initialize())
app.use(passport.session())
//setup mongo database
mongo().then(console.log('mongo connected successfully.')).catch(err => console.log('mongo err: ', err))
async function mongo(){
    await mongoose.connect(process.env.MONGO_URL,{
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
}
//CORS
import cors from 'cors'
app.use(cors({origin: 'https://bioapp.onrender.com', credentials: true, exposedHeaders: 'Set-Cookie'}))
//API

function getDate(){
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDate = new Date()

    const day = days[currentDate.getUTCDay()];
    const date = currentDate.getUTCDate();
    const month = months[currentDate.getUTCMonth()];
    const year = currentDate.getUTCFullYear();
    const formattedDate = `${day} ${date} ${month} ${year}`;

    const hours = String(currentDate.getUTCHours() + 3).padStart(2, '0');
    const minutes = String(currentDate.getUTCMinutes()).padStart(2, '0');
    const formattedTime = `${hours}:${minutes}`;

    return {date: formattedDate, time: formattedTime}
}

//upload keypad game results
app.post('/gameResult', bodyParser.json(), (req, res)=>{
    console.log('/gameResult req received for ' + req.body.game)
    if(req.isAuthenticated()){
        let game = req.body.game;
        let result = req.body.result;
        let {date, time} = getDate();
        const newResult = {result, date, time};
        let update;

        if(game === 'red light green light'){update = {$push: {redLightGreenLight: newResult}}}
        else if(game === 'keypad game'){update = {$push: {keypadGame: newResult}}}
        else if(game === 'memory game'){update = {$push: {memoryGame: newResult}}}
        else if(game === 'math game'){update = {$push: {mathGame: newResult}}}

        User.findOneAndUpdate({ _id: req.user._id },update)
        .then(()=>{
            res.json({success: true})
            console.log('game result added successfully')
        }).catch(err => {
            console.log('Error uploading game result: ', err);
            res.json({success: false, message: "Couldn't upload your result. Please play again"})
        });

    }else{
        console.log('user not authenticated on route /gameResult')
        res.json({success: false, message: 'user not authenticated. Please log in'})
    }
})




//auth routes
import authRouter from './routes/authRoutes.js'
app.use('/auth', authRouter)

//start app
app.listen(2500, ()=>{
    console.log('server up and running on port 2500');
})
