import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { corsOptions } from './configs/cors.js';
import bodyMiddleware from './middlewares/bodyMiddleware.js';
import dbInitMiddleware from './middlewares/dbInitMiddleware.js';
import errorMiddleware from './middlewares/errorMiddleware.js';
import notFoundMiddleware from './middlewares/notFoundMiddleware.js';
import apiRouter from './routes/index.js';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyMiddleware);
app.use(cors(corsOptions));
app.use(helmet());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get(['/', '/api', '/api/v1'], (_req, res) => {
    res.status(418).json({
        success: true,
        message: 'Welcome to IS Media API V1',
        author: 'Islam Ashraf',
        repo: 'https://github.com/TheSolom/IS-Media',
    });
});

app.use(dbInitMiddleware);

app.use('/api/v1', apiRouter);

app.use(notFoundMiddleware);

app.use(errorMiddleware);

export default app;
