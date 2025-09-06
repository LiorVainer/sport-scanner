import { DatePicker, Input, Select } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import { CalendarOutlined, DollarOutlined, EditOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';
import classes from './group-form-screen.module.scss';
import { UsersService } from '@/api/services/users.service';
import { useMutation, useQuery } from '@tanstack/react-query';
import { PublicUser } from '@/models/user.model';
import { zodResolver } from '@hookform/resolvers/zod';
import { GroupFormDefaultValues, GroupFormSchema, GroupFormValues } from './group-form.schema';
import { TextCursorInput } from 'lucide-react';
import { useAuth } from '@/context/AuthContext.tsx';
import { GroupService } from '@api/services/group.service.ts';
import { CreateGroupPayload } from '@/models/group.model.ts';
import { ROUTES } from '@/constants/routes.const.ts';

const { RangePicker } = DatePicker;

export const GroupFormScreen = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const { loggedInUser } = useAuth();
    const isEditMode = !!groupId;
    const navigate = useNavigate();

    const { data: group } = useQuery({
        queryKey: ['group', groupId],
        queryFn: async () => GroupService.getById(groupId!),
        enabled: !!groupId,
    });

    const { mutateAsync: submitGroupForm } = useMutation({
        mutationKey: ['group', isEditMode ? 'update' : 'create'],
        mutationFn: async (formData: GroupFormValues) => {
            const newGroup: CreateGroupPayload = {
                title: formData.title,
                users: formData.users.map(({ value }) => value),
                dates: {
                    start: new Date(formData.dates[0]),
                    end: new Date(formData.dates[1]),
                },
                maxBudget: formData.maxBudget,
            };

            if (!isEditMode) {
                return await GroupService.create(newGroup);
            } else {
                return await GroupService.update(group?._id!, newGroup);
            }
        },
    });

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<GroupFormValues>({
        resolver: zodResolver(GroupFormSchema),
        defaultValues: GroupFormDefaultValues, // always provide initial values
    });

    // Reset when group data is loaded
    useEffect(() => {
        if (group) {
            reset({
                title: group.title,
                users: group.users
                    .filter((user) => user._id !== loggedInUser?._id)
                    .map((user) => ({
                        value: user._id,
                        label: user.username,
                    })),
                dates: [new Date(group.dates.start).toISOString(), new Date(group.dates.end).toISOString()],
                maxBudget: group.maxBudget,
            });
        }
    }, [group, reset]);

    const [searchTerm, setSearchTerm] = useState('');

    const { data: usersData = [] } = useQuery<PublicUser[]>({
        queryKey: ['users', searchTerm],
        queryFn: () => UsersService.getUsers(searchTerm),
        enabled: !!searchTerm,
    });

    const userOptions = useMemo(
        () =>
            usersData
                .filter((user) => user._id !== loggedInUser?._id)
                .map((user) => ({
                    label: user.username,
                    value: user._id,
                })),
        [usersData]
    );

    const onSubmit = async (data: GroupFormValues) => {
        const group = await submitGroupForm(data);

        navigate(`${ROUTES.GROUP_DETAILS}/${group._id}`);
    };

    const onError = (errors: any) => {
        console.error('Validation errors:', errors);
    };

    return (
        <div className={classes.container}>
            <h1>{isEditMode ? 'Edit Group' : 'Create Your Group for the Ultimate Sports Experience'}</h1>

            <form onSubmit={handleSubmit(onSubmit, onError)} className={classes.form}>
                <div className={classes.formItem}>
                    <label className={classes.formTitle}>
                        <TextCursorInput size={18} className={classes.icon} /> Group Name
                    </label>
                    <Controller
                        name="title"
                        control={control}
                        render={({ field }) => (
                            <Input {...field} className={classes.input} placeholder="Enter your group name" />
                        )}
                    />
                    {errors.title && <p className={classes.error}>{errors.title.message}</p>}
                </div>

                <div className={classes.formItem}>
                    <label className={classes.formTitle}>
                        <UsergroupAddOutlined className={classes.icon} /> Group Members
                    </label>
                    <Controller
                        name="users"
                        control={control}
                        render={({ field }) => (
                            <Select
                                {...field}
                                mode="multiple"
                                allowClear
                                showSearch
                                placeholder="Search and select users"
                                className={classes.input}
                                onSearch={(value) => setSearchTerm(value)}
                                filterOption={false}
                                labelInValue
                                options={userOptions}
                            />
                        )}
                    />
                    {errors.users && <p className={classes.error}>{errors.users.message}</p>}
                </div>

                <div className={classes.formItem}>
                    <label className={classes.formTitle}>
                        <CalendarOutlined className={classes.icon} /> Preferred Trip Dates
                    </label>
                    <Controller
                        name="dates"
                        control={control}
                        render={({ field }) => (
                            <RangePicker
                                className={classes.dateRange}
                                format="YYYY-MM-DD"
                                placeholder={['Start Date', 'End Date']}
                                value={[
                                    field.value?.[0] ? dayjs(field.value[0]) : null,
                                    field.value?.[1] ? dayjs(field.value[1]) : null,
                                ]}
                                onChange={(dates) => {
                                    if (dates) {
                                        field.onChange([
                                            dates[0]?.format('YYYY-MM-DD') || '',
                                            dates[1]?.format('YYYY-MM-DD') || '',
                                        ]);
                                    }
                                }}
                            />
                        )}
                    />
                    {errors.dates && <p className={classes.error}>{errors.dates.message}</p>}
                </div>

                <div className={classes.formItem}>
                    <label className={classes.formTitle}>
                        <DollarOutlined className={classes.icon} /> Max Budget per Person
                    </label>
                    <Controller
                        name="maxBudget"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                type="number"
                                min={50}
                                max={10000}
                                step={10}
                                prefix="$"
                                className={classes.input}
                                placeholder="Enter max budget"
                            />
                        )}
                    />
                    {errors.maxBudget && <p className={classes.error}>{errors.maxBudget.message}</p>}
                </div>

                <button className={classes.submitButton}>
                    <EditOutlined />
                    {isEditMode ? 'Update Group' : 'Create Group'}
                </button>
            </form>
        </div>
    );
};
