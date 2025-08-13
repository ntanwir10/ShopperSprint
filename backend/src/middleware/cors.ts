import cors from 'cors';
import { config } from '../config';

const corsOptions = {
  origin:
    config.nodeEnv === 'production'
      ? ['https://your-frontend-domain.com'] // Update with actual frontend domain
      : ['http://localhost:3000', 'http://localhost:5173'], // Common dev ports
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

export const corsMiddleware = cors(corsOptions);
