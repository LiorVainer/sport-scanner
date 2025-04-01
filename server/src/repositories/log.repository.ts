import mongoose, {Document, Schema} from 'mongoose';
import {Log, LogLevels, ProcessTypes} from "../models/log.model";


export const LogMongoSchema = new Schema<LogDocument>(
    {
        message: {type: String, required: true},
        processType: {type: String, enum: Object.values(ProcessTypes), required: true},
        level: {type: String, enum: Object.values(LogLevels), required: true},
        executionTime: {type: Number},
        createdAt: {type: Date, required: true},
        updatedAt: {type: Date, required: true},
        additionalInfo: {type: Schema.Types.Mixed, default: {}},
    },
    {versionKey: false}
);

// Create and export the Mongoose model.
export const LogRepository = mongoose.model('Logs', LogMongoSchema);

// Optional: Type for a Log document that includes Mongoose metadata.
export type LogDocument = Document<unknown, {}, Log> & Log & { __v: number };