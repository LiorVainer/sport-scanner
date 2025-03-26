import bodyParser from 'body-parser';
import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.route';
import usersRoutes from './routes/users.route';
import matchExperienceRoutes from './routes/match-experience.route';
import dotenv from 'dotenv';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express';
import cors from 'cors';
import { handleErrorMiddleware } from './middlewares/error.middleware';
import fileRoutes from './routes/file.route';
import chatRoutes from './routes/chat.route';
import soccerRoutes from './routes/soccer.route';
import { ENV } from './env/env.config';

dotenv.config();
export const app = express();

app.use(bodyParser.json());
app.use(cors({ origin: '*', credentials: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', '*');
    next();
});

const port = ENV.PORT;

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Sport Scanner REST API',
            version: '1.0.0',
            description: 'REST server including authentication using JWT',
        },
        servers: [
            { url: `http://localhost:${port}` },
            { url: `http://10.10.246.116:${port}` },
            { url: `https://node116.cs.colman.ac.il` },
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: ['./src/routes/*.ts'],
};
const specs = swaggerJsDoc(options);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs));

const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to database'));

app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/chat', chatRoutes);
app.use('/match-experiences', matchExperienceRoutes);
app.use('/soccer', soccerRoutes);
app.use('/file', fileRoutes);
app.use('/public', express.static('public'));

export const initServer = async () => {
    const dbConnect = ENV.DB_CONNECT;

    try {
        await mongoose.connect(dbConnect);
        console.log('✅ MongoDB connected');
        return app;
    } catch (error) {
        throw error;
    }
};

app.use(handleErrorMiddleware);
