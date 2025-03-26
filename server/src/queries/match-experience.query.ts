export const lookupCreatedByToUser = {
    $lookup: {
        from: 'users',
        localField: 'createdBy',
        foreignField: '_id',
        as: 'user',
    },
};

export const unwindUser = { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } };

export const projectUserFields = {
    $project: {
        'user.password': 0,
        'user.refreshTokens': 0,
    },
};

export const lookupComments = {
    $lookup: {
        from: 'comments',
        localField: '_id',
        foreignField: 'matchExperienceId',
        as: 'comments',
    },
};

export const sortComments = {
    $set: {
        comments: {
            $sortArray: {
                input: '$comments',
                sortBy: { createdAt: -1 },
            },
        },
    },
};

export const lookupCommentUsers = {
    $lookup: {
        from: 'users',
        localField: 'comments.userId',
        foreignField: '_id',
        as: 'commentUsers',
    },
};

export const mapUsersToComments = {
    $set: {
        comments: {
            $map: {
                input: '$comments',
                as: 'comment',
                in: {
                    $mergeObjects: [
                        '$$comment',
                        {
                            user: {
                                $arrayElemAt: [
                                    {
                                        $filter: {
                                            input: '$commentUsers',
                                            as: 'user',
                                            cond: { $eq: ['$$user._id', '$$comment.userId'] },
                                        },
                                    },
                                    0,
                                ],
                            },
                        },
                    ],
                },
            },
        },
    },
};

export const projectCommentUsersFields = {
    $project: {
        'comments.user.password': 0,
        'comments.user.refreshTokens': 0,
        commentUsers: 0,
    },
};


export const projectCommentIds = {
    $project: {
        _id: 1, 
        createdBy: 1, 
        user: 1, 
        commentIds: {
            $map: {
                input: '$comments',
                as: 'comment',
                in: '$$comment._id',
            },
        },
    },
};

export const likesCountQuery = { $addFields: { likesCount: { $size: "$likes" } } };
