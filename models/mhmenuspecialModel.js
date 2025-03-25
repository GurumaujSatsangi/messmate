
import mongoose from "mongoose";

const mhmenuspecialSchema = new mongoose.Schema({
    date: Date,
    breakfast: String,
    lunch: String,
    snack: String,
    dinner: String

});

const MHMenuSpecial = mongoose.model('MHMenuSpecial', mhmenuspecialSchema);

export default MHMenuSpecial;