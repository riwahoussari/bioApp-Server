import passport from 'passport'
import User from '../models/userModel.js'
import { Strategy as LocalStrategy } from 'passport-local';

passport.use('user', new LocalStrategy(User.authenticate()));
passport.serializeUser((user, done)=>{
    done(null, {id: user.id})
})
passport.deserializeUser(async (user, done) => {
    try {  
      let loadedUser = await User.findById(user.id);
      done(null, loadedUser);
    } catch (error) {
      done(error);
    }
});

const localRegister = (req, res)=>{
    console.log('Register request received')
    const {username, password, age, gender} = req.body;

    User.findOne({username}).then(user => {
        if(user){
            res.json({success: false, message: 'username already exists. Please try another one.'})
        }else{
            User.register(new User({username, userType: 'user', age, gender}), password, (err,user)=>{
                if(err){
                    console.log(err);
                    res.json({success: false, message: err.message})
                }
                else{
                    passport.authenticate('user')(req, res, ()=>{
                        console.log('Register request: new user created successfully')
                        res.json({
                            success: true,
                            user: {_id: user._id, username: user.username, userType: user.userType, age: user.age, gender: user.gender}
                        })
                    })
                }
            })
        }
    })
}


const localLogin = (req, res)=>{
    console.log('Login req received')
    User.findOne({username: req.body.username}).then(user => {
        if(!user){
            res.json({success: false, message: 'username or password is incorrect'})
            console.log('Login request: username is incorrect')
        }else{
            const newUser = {
                userType: 'user',
                username: req.body.username,
                password: req.body.password
            }
            req.login(newUser, function(err){
                if(err){
                    console.log(err)
                    res.json({success: false, message: "Server couldn't log you in. Please try again."})
                }else{
                    passport.authenticate('user')(req, res, function(){
                        console.log('Login request: successfull')
                        res.json({success: true, user})
                    })
                }
            })
        }
    })

}

const Local = {localRegister, localLogin}
export default Local
