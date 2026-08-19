const mongoose = require('mongoose');

const dailyMetricSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, unique: true },
    newUsers: { type: Number, required: true, default: 0 },
  },
  { timestamps: true, collection: 'analytics' }
);

module.exports = mongoose.model('DailyMetric', dailyMetricSchema);
