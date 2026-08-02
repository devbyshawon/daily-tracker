const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const taskRoutes = require('./routes/taskRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
connectDB();

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.use('/api/tasks', taskRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 6001;
app.listen(PORT, () => 
    console.log(`Server running on port ${PORT}`)
);