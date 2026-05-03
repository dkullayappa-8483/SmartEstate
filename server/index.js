require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const propertiesRouter = require('./routes/properties');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/properties', propertiesRouter);

// Serve static frontend files
const path = require('path');
app.use(express.static(path.join(__dirname, '../client')));

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// Fallback to index.html for frontend routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://kenzo848363:Kenzo123@cluster0.75zhzg2.mongodb.net/realestate?retryWrites=true&w=majority', {
  serverSelectionTimeoutMS: 5000 // fail fast if no DB
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('Error connecting to MongoDB:', error.message);
  console.log('Proceeding without DB. Property API will return empty or error.');
});

// Always listen so Cloud Run health check passes
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
