require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const Product = require('../src/models/product.model');
const Asset = require('../src/models/asset.model');
const Device = require('../src/models/device.model');

function imageFor(seed) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/480/360`;
}

const PRODUCTS = [
  { name: 'Wireless Mouse', sku: 'SKU-1001', category: 'Electronics', price: 19.99, stock: 120 },
  { name: 'Mechanical Keyboard', sku: 'SKU-1002', category: 'Electronics', price: 59.99, stock: 75 },
  { name: 'Standing Desk', sku: 'SKU-1003', category: 'Furniture', price: 249.99, stock: 15 },
  { name: 'Office Chair', sku: 'SKU-1004', category: 'Furniture', price: 129.99, stock: 30 },
  { name: 'USB-C Hub', sku: 'SKU-1005', category: 'Electronics', price: 24.99, stock: 200 },
  { name: 'Monitor 27"', sku: 'SKU-1006', category: 'Electronics', price: 179.99, stock: 40 },
  { name: 'Desk Lamp', sku: 'SKU-1007', category: 'Furniture', price: 34.99, stock: 60 },
  { name: 'Webcam HD', sku: 'SKU-1008', category: 'Electronics', price: 39.99, stock: 90 },
  { name: 'Notebook Pack', sku: 'SKU-1009', category: 'Office Supplies', price: 4.99, stock: 500 },
  { name: 'Whiteboard', sku: 'SKU-1010', category: 'Office Supplies', price: 44.99, stock: 20 },
  { name: 'Laptop Stand', sku: 'SKU-1011', category: 'Electronics', price: 29.99, stock: 80 },
  { name: 'Noise Cancelling Headphones', sku: 'SKU-1012', category: 'Electronics', price: 89.99, stock: 45 },
].map((p) => ({ ...p, imageUrl: imageFor(p.sku) }));

const ASSETS = [
  { name: 'Dell Latitude 5540', assetTag: 'AST-2001', category: 'Laptop', status: 'In Use', location: 'HQ - Floor 2' },
  { name: 'MacBook Pro 16', assetTag: 'AST-2002', category: 'Laptop', status: 'Available', location: 'IT Storage' },
  { name: 'HP LaserJet Printer', assetTag: 'AST-2003', category: 'Printer', status: 'Maintenance', location: 'HQ - Floor 1' },
  { name: 'Conference Room TV', assetTag: 'AST-2004', category: 'Display', status: 'In Use', location: 'HQ - Conf Room A' },
  { name: 'Cisco Router', assetTag: 'AST-2005', category: 'Networking', status: 'In Use', location: 'Server Room' },
  { name: 'Standing Desk Unit 12', assetTag: 'AST-2006', category: 'Furniture', status: 'In Use', location: 'HQ - Floor 3' },
  { name: 'Projector EPX-200', assetTag: 'AST-2007', category: 'Display', status: 'Available', location: 'IT Storage' },
  { name: 'Server Rack A1', assetTag: 'AST-2008', category: 'Server', status: 'In Use', location: 'Server Room' },
  { name: 'iPad Air', assetTag: 'AST-2009', category: 'Tablet', status: 'Retired', location: 'IT Storage' },
  { name: 'Dell Monitor 27"', assetTag: 'AST-2010', category: 'Display', status: 'In Use', location: 'HQ - Floor 2' },
  { name: 'UPS Battery Backup', assetTag: 'AST-2011', category: 'Power', status: 'Maintenance', location: 'Server Room' },
  { name: 'Office Chair Batch 4', assetTag: 'AST-2012', category: 'Furniture', status: 'Available', location: 'HQ - Floor 1' },
].map((a) => ({ ...a, imageUrl: imageFor(a.assetTag) }));

const DEVICES = [
  { name: 'iPhone 15 Pro', serialNumber: 'SN-3001', deviceType: 'Mobile', status: 'Online', assignedTo: 'Priya Shah' },
  { name: 'Samsung Galaxy S24', serialNumber: 'SN-3002', deviceType: 'Mobile', status: 'Offline', assignedTo: 'Diego Alvarez' },
  { name: 'iPad Pro 12.9', serialNumber: 'SN-3003', deviceType: 'Tablet', status: 'Online', assignedTo: 'Fatima Noor' },
  { name: 'ThinkPad X1 Carbon', serialNumber: 'SN-3004', deviceType: 'Laptop', status: 'Online', assignedTo: 'Liam Chen' },
  { name: 'Raspberry Pi 4', serialNumber: 'SN-3005', deviceType: 'IoT', status: 'Online', assignedTo: 'Lab - Room 3' },
  { name: 'Smart Thermostat', serialNumber: 'SN-3006', deviceType: 'IoT', status: 'Online', assignedTo: 'HQ - Floor 2' },
  { name: 'Security Camera 01', serialNumber: 'SN-3007', deviceType: 'IoT', status: 'Online', assignedTo: 'HQ - Entrance' },
  { name: 'Security Camera 02', serialNumber: 'SN-3008', deviceType: 'IoT', status: 'Offline', assignedTo: 'HQ - Parking' },
  { name: 'Barcode Scanner', serialNumber: 'SN-3009', deviceType: 'Peripheral', status: 'Inactive', assignedTo: 'Warehouse' },
  { name: 'Kindle Scribe', serialNumber: 'SN-3010', deviceType: 'Tablet', status: 'Offline', assignedTo: 'Ravi Kumar' },
  { name: 'Pixel 8', serialNumber: 'SN-3011', deviceType: 'Mobile', status: 'Online', assignedTo: 'Sofia Rossi' },
  { name: 'Label Printer', serialNumber: 'SN-3012', deviceType: 'Peripheral', status: 'Online', assignedTo: 'Shipping Dept' },
].map((d) => ({ ...d, imageUrl: imageFor(d.serialNumber) }));

async function upsertAll(Model, docs, uniqueKey, label) {
  const now = new Date();
  const ops = docs.map((doc) => ({
    updateOne: {
      filter: { [uniqueKey]: doc[uniqueKey] },
      update: { $set: doc, $setOnInsert: { __v: 0, createdAt: now, updatedAt: now } },
      upsert: true,
    },
  }));
  const result = await Model.collection.bulkWrite(ops, { ordered: false });
  console.log(`${label}: matched ${result.matchedCount}, upserted ${result.upsertedCount}.`);
}

async function seed() {
  await connectDB();

  await upsertAll(Product, PRODUCTS, 'sku', 'products');
  await upsertAll(Asset, ASSETS, 'assetTag', 'assets');
  await upsertAll(Device, DEVICES, 'serialNumber', 'devices');

  await mongoose.disconnect();
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
