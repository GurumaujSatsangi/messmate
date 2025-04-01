
import mongoose from "mongoose";

const lhmenuvegSchema = new mongoose.Schema({
    submitted_by:String,
    hostel_type:String,
    block:String,
    mess_type:String,
    mess:String,
    breakfast: String,
    lunch: String,
    snacks: String,
    dinner: String,     status:String


});

const LHMenuVeg = mongoose.model('LHMenuVeg', lhmenuvegSchema);

export default LHMenuVeg;