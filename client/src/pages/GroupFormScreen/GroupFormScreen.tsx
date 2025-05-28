import { Button, DatePicker, Input, Select } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import { CalendarOutlined, DollarOutlined, EditOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import classes from './group-form-screen.module.scss';
import { UsersService } from '@/api/services/users.service';
import { useMutation, useQuery } from '@tanstack/react-query';
import { PublicUser } from '@/models/user.model';
import { zodResolver } from '@hookform/resolvers/zod';
import { GroupFormDefaultValues, GroupFormSchema, GroupFormValues } from './group-form.schema';
import { TextCursorInput } from 'lucide-react';
import { useAuth } from '@/context/AuthContext.tsx';
import { GroupService } from '@api/services/group.service.ts';
import { ROUTES } from '@/constants/routes.const';

const { RangePicker } = DatePicker;

export const GroupFormScreen = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const { loggedInUser } = useAuth();
    const isEditMode = !!groupId;
    const navigate = useNavigate();

    //TODO: Implement Group Fetch From Server
    const { data: group } = useQuery({
        queryKey: ['group', groupId],
        queryFn: async () => GroupService.getById(groupId!),
        enabled: !!groupId,
    });

    //TODO: Implement Group Create / Update with Server
    const { mutateAsync: submitGroupForm } = useMutation({
        mutationKey: ['group', isEditMode ? 'create' : 'update'],
        mutationFn: async (group: GroupFormValues) =>
            isEditMode ? GroupService.create(group) : GroupService.create(group),
    });

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<GroupFormValues>({
        resolver: zodResolver(GroupFormSchema),
        defaultValues: group ?? GroupFormDefaultValues,
    });

    const [searchTerm, setSearchTerm] = useState('');

    const { data: usersData = [] } = useQuery<PublicUser[]>({
        queryKey: ['users', searchTerm],
        queryFn: () => UsersService.getUsers(searchTerm),
        enabled: !!searchTerm,
    });

    const userOptions = useMemo(
        () =>
            usersData.map((user) => ({
                label: user.username,
                value: user._id,
            })),
        [usersData]
    );

    const onSubmit = async (data: GroupFormValues) => {
        const group = submitGroupForm(data); // TODO: get the group created?
        
        navigate(ROUTES.GROUP_DETAILS, { state: { group } });
    };

    if (isEditMode) {
        const isUserInGroup = group?.users?.find((user) => user._id === loggedInUser?._id);

        if (isUserInGroup) {
            return (
                <div className={classes.container}>
                    <h1>You Are Not Part Of This Group</h1>
                </div>
            );
        }
    }

    return (
        <div className={classes.container}>
            <h1>{isEditMode ? 'Edit Group' : 'Create Your Group for the Ultimate Sports Experience'}</h1>

            <form onSubmit={handleSubmit(onSubmit)} className={classes.form}>
                <div className={classes.formItem}>
                    <label className={classes.formTitle}>
                        <TextCursorInput size={18} className={classes.icon} /> Group Name
                    </label>
                    <Controller
                        name="groupName"
                        control={control}
                        render={({ field }) => (
                            <Input {...field} className={classes.input} placeholder="Enter your group name" />
                        )}
                    />
                    {errors.groupName && <p className={classes.error}>{errors.groupName.message}</p>}
                </div>

                <div className={classes.formItem}>
                    <label className={classes.formTitle}>
                        <UsergroupAddOutlined className={classes.icon} /> Group Members
                    </label>
                    <Controller
                        name="members"
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
                                options={userOptions}
                            />
                        )}
                    />
                    {errors.members && <p className={classes.error}>{errors.members.message}</p>}
                </div>

                <div className={classes.formItem}>
                    <label className={classes.formTitle}>
                        <CalendarOutlined className={classes.icon} /> Preferred Trip Dates
                    </label>
                    <Controller
                        name="tripDates"
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
                    {errors.tripDates && <p className={classes.error}>{errors.tripDates.message}</p>}
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

                <Button type="primary" htmlType="submit" icon={<EditOutlined />} className={classes.submitButton}>
                    Create Group
                </Button>
            </form>
        </div>
    );
};
