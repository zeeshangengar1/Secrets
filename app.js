//jshint esversion:6
require('dotenv').config()
const express=require("express")
const app=express()
const bodyParser=require("body-parser")
const mongoose=require("mongoose")
// const md5=require("md5")  level 3 hashing
// const bcrypt=require("bcrypt") 
//level 4 salting
// const saltRounds=10

// level 1 is just storing credentials plainly
// const encrypt=require("mongoose-encryption")  level 2 encryption
const ejs=require("ejs")

//cookies and session packages
const session=require("express-session")
const passport=require("passport")
const passMon=require("passport-local-mongoose")


app.use(express.static("public"))
app.set('view engine','ejs')
app.use(bodyParser.urlencoded({extended:true}));

//cookies and session
app.use(session({
    secret:"Our little secret",
    resave:false,
    saveUninitialized:false
}))

app.use(passport.initialize())
app.use(passport.session())


mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true})

const userSchema=new mongoose.Schema({
    email: String,
    password: String
})

userSchema.plugin(passMon)

// const secret="Thisisatinylittlesecretcode."
// userSchema.plugin(encrypt,{secret:process.env.SECRET, encryptedFields:["password"]})  level 2 encryption
   
const User=new mongoose.model("User",userSchema);

//cookies and session
passport.use(User.createStrategy())
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


app.get("/",function(req,res)
{
    res.render("home")
})

app.get("/login",function(req,res) 
{
    res.render("login")
})

app.get("/register",function(req,res)
{
    res.render("register")
})


app.get("/secrets",function(req,res)
{
    if(req.isAuthenticated())
    {
        res.render("secrets")
    }else
    {
        res.redirect("/login")
    }
})

//post for session
app.post("/register",function(req,res)
{
    User.register({username:req.body.username},req.body.password,function(err,user)
    {
        if(err)
        {
            console.log(err)
            res.redirect("/register")
        }
        else{
            passport.authenticate("local")(req,res,function()
            {
              res.redirect("/secrets")
            })
        }
    })
})
//post for session and cookies
app.post("/login",function(req,res)
{
     const user=new User(
        {
            username:req.body.username,
            password:req.body.password
        }
     )
     req.login(user,function(err)
     {
        if(err) 
        {console.log(err)
            res.redirect("/login")}
        else passport.authenticate("local")(req,res,function()
        {
            res.redirect("/secrets")
        })
     })
})

//logout for session
app.get("/logout",function(req,res)
{
    req.logout(function(err)
    {
        if(err) console.log(err)
    })
    res.redirect("/")
})

// app.post("/register",function(req,res)
// {
//     const email=req.body.username;
//     const password=req.body.password;


//     bcrypt.hash(password,saltRounds,function(err,hash)
//     {
//         const newUser=new User(
//             {
//                 email:email,
//                 password:hash
//                 //level 4 saltng
//             }
//         )
//         newUser.save(function(err)
//         {
//             if(err) console.log(err)
//             else res.render("secrets");
//         })

//     })

//     // const newUser=new User(
//     //     {
//     //         email:email,
//     //         // password: password  level 1 and 2 matching plainly
//     //         password:md5(password)
//     //         //level 3 hashing
//     //     }
//     // )
//     // newUser.save(function(err)
//     // {
//     //     if(err) console.log(err)
//     //     else res.render("secrets");
//     // })

// })


// app.post("/login",function(req,res)
// {
//     const email=req.body.username;
//     const password=req.body.password;
// //level 4 slating and bcrypt 
// User.findOne({email:email},function(err,foundUser)
// {
//   if(err) console.log(err)
//   else{
//       if(foundUser)
//       {
//         bcrypt.compare(password,foundUser.password,function(error,result)
//         {
//            if(result==true) res.render("secrets")
//         })
//       }
//       else res.send("NO user with this credentials")
//   }
// })


//     // console.log(md5(password))
// //   User.findOne({email:email},function(err,foundUser)
// //   {
// //     if(err) console.log(err)
// //     else{
// //         if(foundUser)
// //         {
// //             // if(foundUser.password==password) res.render("secrets")
// //             // level 1 nad 2 comparing plainly
// //             if(foundUser.password==password) res.render("secrets")
// //             //level 3 hashing
// //         }
// //         else res.send("NO user with this credentials")
// //     }
// //   })

// })


// app.get("/secrets",function(req,res)
// {
//     res.render("secrets")
// })





app.listen(3000,function()
{
    console.log("Server running fine!")
})