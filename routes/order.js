const express = require('express')
const r̥outer  = express.Router()
const OrderController = require('../controllers/OrderController');

r̥outer.post('/create', OrderController.createOrder); // Create Order
r̥outer.get('/all', OrderController.getOrders); // Get All Orders
r̥outer.get('/getOrdersByPhone', OrderController.getOrdersByPhone)
r̥outer.get('/getById', OrderController.getOrderById); // Get Order by ID
r̥outer.put('/update-status', OrderController.updateOrderStatus); // Update Order Status
r̥outer.delete('/delete', OrderController.deleteOrder); // Delete Order

module.exports = r̥outer;
