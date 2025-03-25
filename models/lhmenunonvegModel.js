
import mongoose from "mongoose";

const lhmenunonvegSchema = new mongoose.Schema({
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

const LHMenuNonVeg = mongoose.model('LHMenuNonVeg', lhmenunonvegSchema);

export default LHMenuNonVeg;