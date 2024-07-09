import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './src/modules/users/users.routers.js';
import messageRoutes from './src/modules/messages/messages.routers.js';
import auth from './src/middlewares/auth.js'
import { errorHandler } from './src/utils/errorhandler.js';
dotenv.config();

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

app.use('/api/auth', authRoutes);
app.use('/api/messages',auth, messageRoutes);


app.all('*', (req, res, next) => {
  const error = new Error(`Cannot ${req.method} ${req.originalUrl}`)
  error.statusCode = 404
  next(error)
})

app.use(errorHandler)

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
