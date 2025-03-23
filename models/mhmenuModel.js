
import mongoose from "mongoose";

const mhmenuSchema = new mongoose.Schema({
    date: Date,
    breakfast: String,
    lunch: String,
    dinner: String

});

const MHMenu = mongoose.model('MHMenu', mhmenuSchema);
export default MHMenu;
