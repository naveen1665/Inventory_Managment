const express = require('express');
const router = express.Router();
const {
    getEquipment,
    getEquipmentById,
    createEquipment,
    updateEquipment,
    deleteEquipment,
} = require('../controllers/equipmentController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
    .get(protect, getEquipment)
    .post(protect, createEquipment);

router.route('/:id')
    .get(protect, getEquipmentById)
    .put(protect, updateEquipment)
    .delete(protect, deleteEquipment);

module.exports = router;
