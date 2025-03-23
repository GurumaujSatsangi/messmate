import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    hostel: String,
    mess: String,
    password: String 
});


userSchema.statics.login = async function (email, password) {
    const user = await this.findOne({ email });
    if (!user) {
        throw new Error("User not found");
    }
    
    if (user.password !== password) { 
        throw new Error("Incorrect password");
    }

    return user;
};
const User =mongoose.model('User',userSchema);
export default User;
