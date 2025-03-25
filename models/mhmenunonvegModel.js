
import mongoose from "mongoose";

const mhmenunonvegSchema = new mongoose.Schema({
    date: Date,
    breakfast: String,
    lunch: String,
    snack: String,
    dinner: String

});

const MHMenuNonVeg = mongoose.model('MHMenuNonVeg', mhmenunonvegSchema);

export default MHMenuNonVeg;