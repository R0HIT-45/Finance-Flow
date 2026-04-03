import 'dotenv/config';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import authRoutes from './routes/auth';
import recordRoutes from './routes/records';

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

/**
 * Swagger API Documentation
 * Available at http://localhost:3000/api-docs
 */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    persistAuthorization: true,
    displayOperationId: false,
  },
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'FinanceFlow API Docs',
}));

app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);

app.listen(3000, () => {
  console.log('Server running on port 3000');
  console.log('📚 Swagger docs available at http://localhost:3000/api-docs');
});