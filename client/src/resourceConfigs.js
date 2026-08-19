export const PRODUCT_FIELDS = [
  { key: 'name', label: 'Name', type: 'text', required: true, variant: 'title' },
  { key: 'sku', label: 'SKU', type: 'text', required: true, variant: 'code' },
  { key: 'category', label: 'Category', type: 'text', variant: 'tag' },
  { key: 'price', label: 'Price', type: 'number', variant: 'price' },
  { key: 'stock', label: 'Stock', type: 'number', variant: 'text' },
  { key: 'imageUrl', label: 'Image URL', type: 'text', variant: 'image' },
]

export const ASSET_FIELDS = [
  { key: 'name', label: 'Name', type: 'text', required: true, variant: 'title' },
  { key: 'assetTag', label: 'Asset tag', type: 'text', required: true, variant: 'code' },
  { key: 'category', label: 'Category', type: 'text', variant: 'tag' },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: ['Available', 'In Use', 'Maintenance', 'Retired'],
    variant: 'badge',
  },
  { key: 'location', label: 'Location', type: 'text', variant: 'text' },
  { key: 'imageUrl', label: 'Image URL', type: 'text', variant: 'image' },
]

export const DEVICE_FIELDS = [
  { key: 'name', label: 'Name', type: 'text', required: true, variant: 'title' },
  { key: 'serialNumber', label: 'Serial number', type: 'text', required: true, variant: 'code' },
  { key: 'deviceType', label: 'Device type', type: 'text', variant: 'tag' },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: ['Online', 'Offline', 'Inactive'],
    variant: 'badge',
  },
  { key: 'assignedTo', label: 'Assigned to', type: 'text', variant: 'text' },
  { key: 'imageUrl', label: 'Image URL', type: 'text', variant: 'image' },
]
