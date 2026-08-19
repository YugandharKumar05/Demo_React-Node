const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    serialNumber: { type: String, required: true, unique: true },
    deviceType: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Online', 'Offline', 'Inactive'],
      default: 'Offline',
    },
    assignedTo: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Device', deviceSchema);
