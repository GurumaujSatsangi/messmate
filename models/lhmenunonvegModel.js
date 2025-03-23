
import mongoose from "mongoose";

const lhmenunonvegSchema = new mongoose.Schema({
    date: Date,
    breakfast: String,
    lunch: String,
    snack: String,
    dinner: String

});

const LHMenuNonVeg = mongoose.model('LHMenuNonVeg', lhmenunonvegSchema,'lhmenunonvegs');

export default LHMenuNonVeg;