import mongoose from "mongoose";
const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  post: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: true }
});

adminSchema.statics.login = async function (email, password) {
  const admin = await this.findOne({ email });
  if (!admin) {
    throw new Error("User not found");
  }

  if (admin.password !== password) {
    throw new Error("Incorrect password");
  }

  return admin;
};

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
