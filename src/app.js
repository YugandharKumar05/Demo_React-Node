const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const productRoutes = require('./routes/product.routes');
const assetRoutes = require('./routes/asset.routes');
const deviceRoutes = require('./routes/device.routes');
const requireAuth = require('./middleware/auth.middleware');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', requireAuth, userRoutes);
app.use('/api/analytics', requireAuth, analyticsRoutes);
app.use('/api/products', requireAuth, productRoutes);
app.use('/api/assets', requireAuth, assetRoutes);
app.use('/api/devices', requireAuth, deviceRoutes);

app.use(errorHandler);

module.exports = app;
