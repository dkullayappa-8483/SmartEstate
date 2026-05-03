const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  bedrooms: { type: Number, required: true },
  bathrooms: { type: Number, required: true },
  sqft: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  type: { type: String, enum: ['House', 'Apartment', 'Condo', 'Townhouse', 'Villa'], default: 'House' },
  status: { type: String, enum: ['For Sale', 'For Rent'], default: 'For Sale' },
  featured: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);
