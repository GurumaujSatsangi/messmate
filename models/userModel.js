import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  hostelType: { type: String, required: true },
  hostel: { type: String, required: true },
  messType: { type: String, required: true },

  mess: { type: String, required: true },
  password: { type: String, required: true },
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
const User = mongoose.model("User", userSchema);
export default User;
