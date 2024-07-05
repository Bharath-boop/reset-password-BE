import mongoose from "./index.js";

const userSchema = new mongoose.Schema({
    email: { type: String, required: [true, "Email is Requied"] },
    password: { type: String, required: [true, "password is Requied"] }
})

const userModel = mongoose.model('user', userSchema)

export default userModel