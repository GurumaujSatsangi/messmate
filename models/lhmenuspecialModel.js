
import mongoose from "mongoose";

const lhmenuspecialSchema = new mongoose.Schema({
    date: Date,
    breakfast: String,
    lunch: String,
    snack: String,
    dinner: String

});

const LHMenuSpecial = mongoose.model('LHMenuSpecial', lhmenuspecialSchema,'lhmenuspecials');

export default LHMenuSpecial;