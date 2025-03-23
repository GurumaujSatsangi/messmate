
import mongoose from "mongoose";

const mhmenuvegSchema = new mongoose.Schema({
    date: Date,
    breakfast: String,
    lunch: String,
    snack: String,
    dinner: String

});

const MHMenuVeg = mongoose.model('MHMenuVeg', mhmenuvegSchema,'mhmenuvegs');

export default MHMenuVeg;