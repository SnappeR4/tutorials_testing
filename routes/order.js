const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');

// Public routes
router.post('/create', OrderController.createOrder);
router.get('/getById', OrderController.getOrderById);
router.get('/getOrdersByPhone', OrderController.getOrdersByPhone);

// Admin protected routes
router.get('/all', OrderController.getOrders);
router.get('/filter', OrderController.filterOrders);
router.get('/stats', OrderController.getOrderStats);
router.put('/update-status/:orderId', OrderController.updateOrderStatus);
router.put('/update-tracking', OrderController.updateTracking);
router.put('/:id', OrderController.updateOrder);
router.delete('/delete', OrderController.deleteOrder);
router.get('/export', OrderController.exportOrders);

module.exports = router;