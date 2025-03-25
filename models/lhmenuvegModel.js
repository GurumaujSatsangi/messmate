
import mongoose from "mongoose";

const lhmenuvegSchema = new mongoose.Schema({
    date: Date,
    breakfast: String,
    lunch: String,
    snack: String,
    dinner: String

});

const LHMenuVeg = mongoose.model('LHMenuVeg', lhmenuvegSchema);

export default LHMenuVeg;