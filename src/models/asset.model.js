const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    assetTag: { type: String, required: true, unique: true },
    category: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Available', 'In Use', 'Maintenance', 'Retired'],
      default: 'Available',
    },
    location: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Asset', assetSchema);
