const mongoose = require('mongoose');

const equipmentSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add an equipment name'],
            trim: true,
        },
        category: {
            type: String,
            required: [true, 'Please select a category'],
        },
        quantity: {
            type: Number,
            required: [true, 'Please add a quantity'],
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const Equipment = mongoose.model('Equipment', equipmentSchema);

module.exports = Equipment;
