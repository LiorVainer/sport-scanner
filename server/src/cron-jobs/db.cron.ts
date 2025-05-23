import { BaseLogger } from '../logs/base-logger.logger';
import mongoose from 'mongoose';
import { ENV } from '../env/env.config';

const connectToDatabase = async (logger: BaseLogger) => {
    try {
        await mongoose.connect(ENV?.DB_CONNECT);
        logger.info('✅ Successfully connected to MongoDB');
    } catch (error) {
        logger.error('❌ Failed to connect to MongoDB', {
            error,
        });
        throw new Error('Database connection failed');
    }
};

const disconnectFromDatabase = async (logger: BaseLogger) => {
    try {
        await mongoose.disconnect();
        logger.info('🔌 Disconnected from MongoDB');
    } catch (error) {
        logger.error('❌ Error during MongoDB disconnection', {
            error: error,
        });
    }
};

export const DB = {
    connect: connectToDatabase,
    disconnect: disconnectFromDatabase,
};
