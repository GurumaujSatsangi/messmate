
import mongoose from "mongoose";

const lhmenuspecialSchema = new mongoose.Schema({
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

const LHMenuSpecial = mongoose.model('LHMenuSpecial', lhmenuspecialSchema);

export default LHMenuSpecial;