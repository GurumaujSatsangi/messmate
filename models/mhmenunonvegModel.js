
import mongoose from "mongoose";

const mhmenunonvegSchema = new mongoose.Schema({
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

const MHMenuNonVeg = mongoose.model('MHMenuNonVeg', mhmenunonvegSchema);

export default MHMenuNonVeg;