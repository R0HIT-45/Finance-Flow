import 'dotenv/config';
import express from 'express';
import authRoutes from './routes/auth';
import recordRoutes from './routes/records';

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});