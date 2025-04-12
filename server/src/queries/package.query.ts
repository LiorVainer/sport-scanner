import mongoose, { PipelineStage } from 'mongoose';

export const populateAggregation = (matchStage: PipelineStage): mongoose.PipelineStage[] => [
    matchStage,
    {
        $lookup: {
            from: 'packages',
            localField: 'packageId',
            foreignField: '_id',
            as: 'package',
        },
    },
    { $unwind: '$package' },
    {
        $sort: { package: -1 },
    },
    {
        $group: {
            _id: {
                $dateToString: { format: '%d/%m/%Y', date: '$createdAt' },
            },
            packages: { $push: '$package' },
        },
    },
    {
        $sort: { _id: -1 },
    },
];
