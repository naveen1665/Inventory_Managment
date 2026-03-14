const asyncHandler = require('express-async-handler');
const Equipment = require('../models/Equipment');

// @desc    Fetch all equipment
// @route   GET /api/equipment
// @access  Private (Admin or Manager)
const getEquipment = asyncHandler(async (req, res) => {
    let criteria = {};

    // If user is a manager, restrict to their category
    if (req.user.role === 'manager') {
        criteria = { category: req.user.category };
    }

    const equipment = await Equipment.find(criteria);
    res.json(equipment);
});

// @desc    Fetch single equipment
// @route   GET /api/equipment/:id
// @access  Private (Admin or Manager)
const getEquipmentById = asyncHandler(async (req, res) => {
    const equipment = await Equipment.findById(req.params.id);

    if (equipment) {
        // If manager, verify it matches their category
        if (req.user.role === 'manager' && equipment.category !== req.user.category) {
            res.status(403);
            throw new Error('Not authorized to access equipment outside your category');
        }
        res.json(equipment);
    } else {
        res.status(404);
        throw new Error('Equipment not found');
    }
});

// @desc    Create equipment
// @route   POST /api/equipment
// @access  Private (Admin or Manager)
const createEquipment = asyncHandler(async (req, res) => {
    const { name, category, quantity } = req.body;

    let equipCategory = category;

    if (req.user.role === 'manager') {
        equipCategory = req.user.category; // Force manager's own category
    }

    const equipment = new Equipment({
        name,
        category: equipCategory,
        quantity,
    });

    const createdEquipment = await equipment.save();
    res.status(201).json(createdEquipment);
});

// @desc    Update equipment
// @route   PUT /api/equipment/:id
// @access  Private (Admin or Manager)
const updateEquipment = asyncHandler(async (req, res) => {
    const { name, category, quantity } = req.body;

    const equipment = await Equipment.findById(req.params.id);

    if (equipment) {
        // Verify Manager
        if (req.user.role === 'manager' && equipment.category !== req.user.category) {
            res.status(403);
            throw new Error('Not authorized to update equipment outside your category');
        }

        equipment.name = name || equipment.name;
        equipment.quantity = quantity !== undefined ? quantity : equipment.quantity;

        // Only admin can change category
        if (req.user.role === 'admin' && category) {
            equipment.category = category;
        }

        const updatedEquipment = await equipment.save();
        res.json(updatedEquipment);
    } else {
        res.status(404);
        throw new Error('Equipment not found');
    }
});

// @desc    Delete equipment
// @route   DELETE /api/equipment/:id
// @access  Private (Admin or Manager)
const deleteEquipment = asyncHandler(async (req, res) => {
    // changed from Equipment.findById(req.params.id);
    const equipment = await Equipment.findById(req.params.id);

    if (equipment) {
        if (req.user.role === 'manager' && equipment.category !== req.user.category) {
            res.status(403);
            throw new Error('Not authorized to delete equipment outside your category');
        }

        // mongoose deleteOne properly
        await equipment.deleteOne();
        res.json({ message: 'Equipment removed' });
    } else {
        res.status(404);
        throw new Error('Equipment not found');
    }
});

module.exports = {
    getEquipment,
    getEquipmentById,
    createEquipment,
    updateEquipment,
    deleteEquipment,
};
