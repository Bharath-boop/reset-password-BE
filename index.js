import express, { text } from 'express'
import cors from 'cors'
import userModel from './models/user.js'
import dotenv from 'dotenv'
import bcrypt, { hash } from 'bcrypt'
import jwt, { decode } from 'jsonwebtoken'
import validator from 'validator'
import mail from './helper/mail.js'
dotenv.config()


const app = express()
const PORT = process.env.PORT || 8000

app.use(cors())
app.use(express.json())

///create token

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET)
}


//crete user

app.post('/create', async (req, res) => {
    const { email, password } = req.body
    try {
        const exists = await userModel.findOne({ email })
        if (exists) {
            return res.json({ success: false, message: "This user Already exists" })
        }
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Pleace enter the valid email" })
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Pleace enter the storge password" })
        }
        const SALT = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, SALT)
        const newUser = new userModel({
            email: email,
            password: hashPassword
        })
        const user = await newUser.save()
        const token = createToken(user._id)
        res.json({ success: true, message: "Successfully user Created", token })

    } catch (error) {
        res.json({ success: false, message: "Error" })
    }
})

//LOGIN USEr

app.post('/login', async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await userModel.findOne({ email })
        if (!user) {
            return res.json({ success: false, message: "User not exists" })
        }
        const ismatch = await bcrypt.compare(password, user.password)
        if (!ismatch) {
            return res.json({ success: false, message: "Incorrecet password" })
        }
        const token = createToken(user._id)
        res.json({ success: true, token })

    } catch (error) {
        res.json({ success: false, message: "Error" })
    }
})

app.post("/forget", async (req, res) => {
    const { email } = req.body;
    try {
        const user = await userModel.findOne({ email })
        if (!user) {
            return res.json({ success: false, message: "User not exitst" })
        }
        else {
            const id = user._id.toString()
            const token = createToken(id)
            let ms = await mail(user.email, id, token)
            return res.json({ success: true, message: ms })
        }

    } catch (error) {
        res.json({ success: false, message: "Error" })
    }
})


app.post('/reset/:id/:token', async (req, res) => {
    const { id, token } = req.params
    const { password } = req.body
    const SALT = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(password, SALT)
    jwt.verify(token, process.env.JWT_SECRET, async (err, decode) => {
        if (err) {
            return res.json({ success: false, message: "Error with Token" })
        }
        else {
            let user = await userModel.findByIdAndUpdate({ _id: id }, { password: hashPassword })
            return res.json({ success: true, message: "Password Updated" })
        }
    })


})





app.listen(PORT, () => {
    console.log(`Application listeing PORT ${PORT}`);
})