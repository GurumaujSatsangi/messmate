
import mongoose from "mongoose";

const lhmenuSchema = new mongoose.Schema({
    date: Date,
    breakfast: String,
    lunch: String,
    dinner: String

});

const LHMenu = mongoose.model('LHMenu', lhmenuSchema);

export default LHMenu;