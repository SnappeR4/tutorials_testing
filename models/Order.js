const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    orderId: { type: String, unique: true, required: true }, // Unique Order ID
    date: { type: Date, default: Date.now }, // Order Date
    time: { type: String, required: true }, // Order Time (HH:mm)
    customer: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        address: {
            houseFloor: String,
            buildingBlock: String,
            landmarkArea: String,
            city: String,
            state: String,
            postalCode: String,
            location: String
        }
    },
    products: [
        {
            name: { type: String, required: true },
            category: { type: String, required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true }
        }
    ],
    subtotal: { type: Number, required: true },
    couponCode: { type: String, default: null },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    trackingId: { type: String, default: '' },
    status: { type: String, enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
    expectedDeliveryDate: { type: Date, required: true }
});

module.exports = mongoose.model('Order', OrderSchema);
