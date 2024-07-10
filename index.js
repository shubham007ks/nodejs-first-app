import express, { urlencoded } from "express";
import path from "path"
import mongoose from "mongoose"
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken"
import bcrypt from 'bcrypt'


const app = express()


mongoose.connect("mongodb://127.0.0.1:27017", {
    dbName: "backend",
})
    .then(() => console.log("Database Connected"))
    .catch((e) => console.log(e))



// defining schema 
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
})


const User = mongoose.model("Users", userSchema)



// using middleware
app.use(express.static(path.join(path.resolve(), "public")))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())


app.set("view engine", "ejs")


// const isAuthenticated = async (req, res, next) => {

//     const { token } = req.cookies

//     if (token) {

//         const decoded = jwt.verify(token,"qeqwresdfsdfncbn")

//         req.user=await User.findById(decoded._id)

//         next()

//     } else {
//         res.redirect("/login")
//     }
// }


// app.get('/', isAuthenticated, (req, res, next) => {
//     // res.render("logout",{name:req.user.name})
//     res.render("register")
// })

app.get('/', (req, res) => {

    const { token } = req.body

    // if (token) res.render("/login")

    if (token) {
        res.render("logout")
    } else {
        // res.redirect("/register")
        res.redirect("/register")
    }

    // res.redirect("/register")
})

app.get('/register', (req, res) => {
    res.render("register")
})

app.get("/login", (req, res) => {
    res.render("login")
})



app.post("/register", async (req, res) => {

    const { name, email, password } = req.body


    // if (!name || !email || !password) {
    //     return res.status(400).send("All fields are required.");
    // }

    let user = await User.findOne({ email })

    if (user) {
        return res.redirect("/login")
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    user = await User.create({
        name,
        email,
        password: hashedPassword
    })

    // const token = jwt.sign({ _id: user._id }, "qeqwresdfsdfncbn")


    // res.cookie("token", token, {
    //     httpOnly: true,
    //     expires: new Date(Date.now() + 60 * 1000)
    // })

    // res.redirect("/")
    res.redirect("/login")
})

app.post("/login", async (req, res) => {

    const { email, password } = req.body

    let user = await User.findOne({ email })

    // if (!user) res.redirect("/register")
    if (!user) return res.redirect("/register")

    // const chk = (password === user.password)
    const chk =  bcrypt.compare(password,user.password)

    // if (!chk) return res.render("login", { message: "Incorrect Password" })
    if (!chk) return res.render("login", { email, message: "Incorrect Password" })


    const token = jwt.sign({ _id: user._id }, "qeqwresdfsdfncbn")


    res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 1000)
    })

    // res.redirect("/logout")
    // res.render("logout",{name:"Shubham"})
    // res.redirect("/logout")
    res.render("logout")

})

app.get("/logout", (req, res) => {
    res.clearCookie("token");
    // res.redirect("/")
    res.redirect("/login")
});



const port = 5000
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}...`)
})