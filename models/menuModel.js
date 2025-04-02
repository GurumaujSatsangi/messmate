import mongoose from "mongoose";

const menuSchema = new mongoose.Schema({
    day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    breakfast: {
        type: String,
    },
    lunch: {
        type: String,
    },
    snacks: {
        type: String,
    },
    dinner: {
        type: String,
    }
});

const Menu = mongoose.model('Menu', menuSchema);

export default Menu; 