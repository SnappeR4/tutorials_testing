require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session'); // Add this

const AuthRoute = require('./routes/auth');
const TemplateRoute = require('./routes/template');
const AppVersionRoute = require('./routes/appversion');
const ShowADRoute = require('./routes/showad');
const BannerRoutes = require('./routes/banner');
const OrderRoutes = require('./routes/order');
const couponRoutes = require('./routes/coupon');

mongoose.connect(process.env.MONGO_URL);
const db = mongoose.connection;
db.on('error', (err) => {
    console.log(err);
});

db.once('open', () => {
    console.log('DB Connection Success');
});

const app = express();

// Add session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/orderspage', (req, res) => {
    res.render('orders');
});

app.get('/coupons', (req, res) => {
    res.render('coupon');
});

// Add the password verification route directly to app
app.post('/api/verify-admin-password', (req, res) => {
    const { password } = req.body;
    
    if (password === process.env.ADMIN_PASSWORD) {
        req.session.adminAuthenticated = true;
        return res.json({ success: true });
    }
    
    res.status(401).json({ success: false });
});

// Mount other routes
app.use('/api/template', TemplateRoute);
app.use('/api/appversion', AppVersionRoute);
app.use('/api/showad', ShowADRoute);
app.use('/api', AuthRoute);
app.use('/api/shopping', BannerRoutes);
app.use('/api/order', OrderRoutes);
app.use('/api/coupon', couponRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
});