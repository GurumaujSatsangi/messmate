
import mongoose from "mongoose";

const fooditemschema = new mongoose.Schema({
    item:String

});

const FoodItem = mongoose.model('FoodItem', lhmenuSchema);

export default FoodItem;