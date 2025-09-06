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
        $addFields: {
            // Extract the date parts for proper sorting
            dateForGrouping: {
                $dateToString: { format: '%d/%m/%Y', date: '$package.createdAt' },
            },
            sortableDate: '$package.createdAt',
        },
    },
    {
        $group: {
            _id: '$dateForGrouping',
            packages: {
                $push: '$package',
            },
            sortDate: { $min: '$sortableDate' },
        },
    },
    {
        $sort: {
            sortDate: -1, // Sort by actual date, newest first
        },
    },
    {
        $project: {
            _id: 1,
            packages: 1,
            // Remove the sortDate field from final output
        },
    },
];
