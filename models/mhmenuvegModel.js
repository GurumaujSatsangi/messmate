
import mongoose from "mongoose";

const mhmenuvegSchema = new mongoose.Schema({
    submitted_by:String,
    hostel_type:String,
    block:String,
    mess_type:String,
    mess:String,
    breakfast: String,
    lunch: String,
    snacks: String,
    dinner: String,
    status:String

});

const MHMenuVeg = mongoose.model('MHMenuVeg', mhmenuvegSchema);

export default MHMenuVeg;