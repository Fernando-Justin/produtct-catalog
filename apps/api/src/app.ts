import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import passport from './config/passport';
import routes from './routes';
import { errorMiddleware } from './middlewares/error.middleware';
import { env } from './config/env';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(passport.initialize());
app.use('/api', routes);
app.use(errorMiddleware);

export default app;
