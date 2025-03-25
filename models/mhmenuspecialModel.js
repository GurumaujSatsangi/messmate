
import mongoose from "mongoose";

const mhmenuspecialSchema = new mongoose.Schema({
    submitted_by:String,
    hostel_type:String,
    block:String,
    mess_type:String,
    mess:String,
    breakfast: String,
    lunch: String,
    snacks: String,
    dinner: String

});

const MHMenuSpecial = mongoose.model('MHMenuSpecial', mhmenuspecialSchema);

export default MHMenuSpecial;