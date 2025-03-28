const Order = require('../models/Order');

// Generate Unique Order ID
const generateOrderId = () => `ORD${Date.now().toString().slice(-6)}`;

// Get Current Time (HH:mm)
const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours()}:${now.getMinutes()}`;
};

// **1. Create Order**
const createOrder = async (req, res) => {
    try {
        const { customer, products, couponCode, expectedDeliveryDate } = req.body;

        if (!customer || !products || products.length === 0) {
            return res.status(400).json({ message: 'Customer details and at least one product are required' });
        }

        let subtotal = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
        let totalAmount = subtotal; // No discount calculation

        const order = new Order({
            orderId: generateOrderId(),
            date: new Date(),
            time: getCurrentTime(),
            customer,
            products,
            subtotal,
            couponCode, // Storing coupon code as a string
            discount: 0, // No discount applied
            totalAmount,
            expectedDeliveryDate
        });

        await order.save();
        res.status(201).json({ message: 'Order created successfully!', order });
    } catch (error) {
        res.status(500).json({ message: 'Error creating order', error: error.message });
    }
};

// **2. Get All Orders**
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find();
        res.json({ message: 'Orders retrieved successfully!', orders });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
};

// **3. Get Order by ID**
const getOrderById = async (req, res) => {
    try {
        const { id } = req.query;

        if (!id) return res.status(400).json({ message: 'Order ID is required' });

        const order = await Order.findOne({ orderId: id });

        if (!order) return res.status(404).json({ message: 'Order not found' });

        res.json({ message: 'Order retrieved successfully!', order });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching order', error: error.message });
    }
};


// **4. Update Order Status**
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.query;
        const { status, trackingId } = req.body;

        const order = await Order.findOneAndUpdate({ orderId: id }, { status, trackingId }, { new: true });

        if (!order) return res.status(404).json({ message: 'Order not found' });

        res.json({ message: 'Order status updated successfully!', order });
    } catch (error) {
        res.status(500).json({ message: 'Error updating order', error: error.message });
    }
};

// **5. Delete Order**
const deleteOrder = async (req, res) => {
    try {
        const { id } = req.query;

        const order = await Order.findOneAndDelete({ orderId: id });
        if (!order) return res.status(404).json({ message: 'Order not found' });

        res.json({ message: 'Order deleted successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting order', error: error.message });
    }
};

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder
};
