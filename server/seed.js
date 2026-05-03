require('dotenv').config();
const mongoose = require('mongoose');
const Property = require('./models/Property');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://kenzo848363:Kenzo123@ac-6blr86t-shard-00-00.75zhzg2.mongodb.net:27017,ac-6blr86t-shard-00-01.75zhzg2.mongodb.net:27017,ac-6blr86t-shard-00-02.75zhzg2.mongodb.net:27017/realestate?ssl=true&replicaSet=atlas-ut5k4q-shard-0&authSource=admin&retryWrites=true&w=majority';

const sampleProperties = [
  // Villas
  { title: 'Modern Glass Villa', description: 'A stunning modern villa with floor-to-ceiling glass windows, offering panoramic views of the city. Features a smart home system and an infinity pool.', price: 2500000, location: 'Mumbai, MH', bedrooms: 5, bathrooms: 6, sqft: 4500, imageUrl: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800', type: 'Villa', status: 'For Sale', featured: true },
  { title: 'Mediterranean Coastal Villa', description: 'Beautiful villa overlooking the ocean with extensive outdoor living spaces and private beach access.', price: 3200000, location: 'Chennai, TN', bedrooms: 6, bathrooms: 5.5, sqft: 5200, imageUrl: 'https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg?auto=compress&cs=tinysrgb&w=800', type: 'Villa', status: 'For Sale', featured: true },
  { title: 'Tuscan Style Villa', description: 'Classic Italian architecture combined with modern luxury amenities in a secure gated community.', price: 1850000, location: 'Pune, MH', bedrooms: 4, bathrooms: 4, sqft: 3800, imageUrl: 'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=800', type: 'Villa', status: 'For Rent', featured: false },
  
  // Houses
  { title: 'Cozy Suburban Retreat', description: 'A beautiful family home situated in a quiet, friendly neighborhood. Features a large backyard perfect for entertaining, and a newly renovated kitchen.', price: 750000, location: 'Bangalore, KA', bedrooms: 4, bathrooms: 2.5, sqft: 2400, imageUrl: 'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=800', type: 'House', status: 'For Sale', featured: false },
  { title: 'Mountain View Cabin', description: 'Escape the city in this serene mountain view cabin. Surrounded by nature, it offers a large deck, hot tub, and a cozy stone fireplace.', price: 550000, location: 'Pune, MH', bedrooms: 3, bathrooms: 2, sqft: 2000, imageUrl: 'https://images.pexels.com/photos/209296/pexels-photo-209296.jpeg?auto=compress&cs=tinysrgb&w=800', type: 'House', status: 'For Sale', featured: true },
  { title: 'Modern Minimalist House', description: 'Clean lines and open spaces define this contemporary masterpiece built with sustainable materials.', price: 920000, location: 'Hyderabad, TS', bedrooms: 3, bathrooms: 3, sqft: 2100, imageUrl: 'https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg?auto=compress&cs=tinysrgb&w=800', type: 'House', status: 'For Sale', featured: false },
  { title: 'Traditional Family Home', description: 'Spacious home with a wrap-around porch and a large garden. Perfect for a growing family.', price: 680000, location: 'Chennai, TN', bedrooms: 5, bathrooms: 3.5, sqft: 3100, imageUrl: 'https://images.pexels.com/photos/210617/pexels-photo-210617.jpeg?auto=compress&cs=tinysrgb&w=800', type: 'House', status: 'For Rent', featured: false },

  // Apartments
  { title: 'Luxury Downtown Penthouse', description: 'Experience the pinnacle of urban living in this luxurious penthouse. Located in the heart of downtown, steps away from fine dining and entertainment.', price: 1250000, location: 'Delhi, DL', bedrooms: 3, bathrooms: 3.5, sqft: 2800, imageUrl: 'https://images.pexels.com/photos/277667/pexels-photo-277667.jpeg?auto=compress&cs=tinysrgb&w=800', type: 'Apartment', status: 'For Sale', featured: true },
  { title: 'Chic Studio Apartment', description: 'Perfect city base. This stylishly furnished studio offers convenience and luxury in a compact space.', price: 3200, location: 'Kolkata, WB', bedrooms: 1, bathrooms: 1, sqft: 650, imageUrl: 'https://images.pexels.com/photos/275484/pexels-photo-275484.jpeg?auto=compress&cs=tinysrgb&w=800', type: 'Apartment', status: 'For Rent', featured: false },
  { title: 'Modern High-Rise Apartment', description: 'Breathtaking city skyline views from the 42nd floor. Access to building amenities including gym and pool.', price: 850000, location: 'Bangalore, KA', bedrooms: 2, bathrooms: 2, sqft: 1100, imageUrl: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800', type: 'Apartment', status: 'For Sale', featured: false },

  // Condos
  { title: 'Oceanfront Condo', description: 'Wake up to the sound of waves in this stunning oceanfront condo. Offers direct beach access, resort-style amenities, and a spacious balcony.', price: 4500, location: 'Mumbai, MH', bedrooms: 2, bathrooms: 2, sqft: 1200, imageUrl: 'https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?auto=compress&cs=tinysrgb&w=800', type: 'Condo', status: 'For Rent', featured: true },
  { title: 'Urban Loft Condo', description: 'Industrial chic design with exposed brick walls and high ceilings in a vibrant arts district.', price: 620000, location: 'Mumbai, MH', bedrooms: 1, bathrooms: 1.5, sqft: 950, imageUrl: 'https://images.pexels.com/photos/259950/pexels-photo-259950.jpeg?auto=compress&cs=tinysrgb&w=800', type: 'Condo', status: 'For Sale', featured: false },
  { title: 'Luxury Resort Condo', description: 'Enjoy vacation living year-round with world-class amenities right at your doorstep.', price: 780000, location: 'Chennai, TN', bedrooms: 3, bathrooms: 2, sqft: 1500, imageUrl: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=800', type: 'Condo', status: 'For Sale', featured: true },

  // Townhouses
  { title: 'Historic Townhouse', description: 'Charm meets modern convenience in this beautifully restored historic townhouse. Features original hardwood floors, exposed brick, and a private courtyard.', price: 850000, location: 'Delhi, DL', bedrooms: 3, bathrooms: 2, sqft: 1800, imageUrl: 'https://images.pexels.com/photos/221540/pexels-photo-221540.jpeg?auto=compress&cs=tinysrgb&w=800', type: 'Townhouse', status: 'For Sale', featured: false },
  { title: 'Modern Eco-Townhouse', description: 'LEED certified home with solar panels and energy efficient appliances throughout.', price: 720000, location: 'Bangalore, KA', bedrooms: 2, bathrooms: 2.5, sqft: 1400, imageUrl: 'https://images.pexels.com/photos/208736/pexels-photo-208736.jpeg?auto=compress&cs=tinysrgb&w=800', type: 'Townhouse', status: 'For Sale', featured: true },
  { title: 'Elegant Brick Townhome', description: 'Spacious three-story layout located in a highly walkable neighborhood close to parks and schools.', price: 4200, location: 'Delhi, DL', bedrooms: 4, bathrooms: 3, sqft: 2200, imageUrl: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800', type: 'Townhouse', status: 'For Rent', featured: false }
];

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    await Property.deleteMany({});
    console.log('Cleared existing properties');
    await Property.insertMany(sampleProperties);
    console.log('Inserted sample properties');
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error seeding database:', err);
    mongoose.connection.close();
  });
