import mongoose, { PipelineStage } from 'mongoose';

export const populateAggregation = (matchStage: PipelineStage): mongoose.PipelineStage[] => [
    matchStage,
    {
        $sort: {
            createdAt: -1,
        },
    },
    {
        $lookup: {
            from: 'packages',
            localField: 'packageId',
            foreignField: '_id',
            as: 'package',
        },
    },
    {
        $unwind: '$package',
    },
    {
        $group: {
            _id: {
                $dateToString: { format: '%d/%m/%Y', date: '$createdAt' },
            },
            packages: {
                $push: {
                    $mergeObjects: [
                        '$package',
                        { createdAt: '$createdAt' }, // Optionally attach history's createdAt
                    ],
                },
            },
        },
    },
    {
        $sort: {
            _id: -1,
        },
    },
];
