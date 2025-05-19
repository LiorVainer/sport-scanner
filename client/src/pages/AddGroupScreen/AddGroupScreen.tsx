import { Button, DatePicker, Input, Select } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import {
  UsergroupAddOutlined,
  CalendarOutlined,
  DollarOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import classes from './add-group-screen.module.scss';
import { UsersService } from '@/api/services/users.service';

const { RangePicker } = DatePicker;

interface GroupFormValues {
  groupName: string;
  members: string[];
  tripDates: [string, string];
  budget: {
    min: string;
    max: string;
  };
}

export const AddGroupScreen = () => {
  const location = useLocation();
  const state = location.state as { group?: Partial<GroupFormValues> } | null;

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<GroupFormValues>({
    defaultValues: {
      groupName: state?.group?.groupName ?? '',
      members: state?.group?.members ?? [],
      tripDates: state?.group?.tripDates ?? ['', ''],
      budget: {
        min: state?.group?.budget?.min ?? '',
        max: state?.group?.budget?.max ?? '',
      },
    },
  });

  const [userOptions, setUserOptions] = useState<{ label: string; value: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await UsersService.getUsers(searchTerm);
        const options = users.map((user: any) => ({
          label: user.username,
          value: user._id,
        }));
        setUserOptions(options);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    if (searchTerm) {
      fetchUsers();
    }
  }, [searchTerm]);

  const onSubmit = (data: GroupFormValues) => {
    console.log('Form submitted with data:', data);
  };

  return (
    <div className={classes.container}>
      <h1 className={classes.title}>Create Your Group for the Ultimate Sports Experience</h1>

      <form onSubmit={handleSubmit(onSubmit)} className={classes.form}>
        {/* Group Name */}
        <div>
          <label className={classes.formTitle}>
            <UsergroupAddOutlined className={classes.icon} /> Group Name
          </label>
          <Controller
            name="groupName"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Input {...field} className={classes.input} placeholder="Enter your group name" />
            )}
          />
          {errors.groupName && <p className={classes.error}>Group name is required</p>}
        </div>

        {/* Members */}
        <div>
          <label className={classes.formTitle}>
            <UsergroupAddOutlined className={classes.icon} /> Group Members
          </label>
          <Controller
            name="members"
            control={control}
            rules={{ required: true }}
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
          {errors.members && <p className={classes.error}>At least one group member is required</p>}
        </div>

        {/* Trip Dates */}
        <div>
          <label className={classes.formTitle}>
            <CalendarOutlined className={classes.icon} /> Preferred Trip Dates
          </label>
          <Controller
            name="tripDates"
            control={control}
            rules={{
              validate: (val) => val[0] !== '' && val[1] !== '',
            }}
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
          {errors.tripDates && <p className={classes.error}>Trip date range is required</p>}
        </div>

        {/* Budget */}
        <div>
          <label className={classes.formTitle}>
            <DollarOutlined className={classes.icon} /> Budget Range per Person
          </label>
          <div className={classes.budgetInputs}>
            <Controller
              name="budget.min"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input {...field} className={classes.input} placeholder="e.g., 100$" />
              )}
            />
            <span className={classes.arrow}>→</span>
            <Controller
              name="budget.max"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input {...field} className={classes.input} placeholder="e.g., 1000$" />
              )}
            />
          </div>
          {(errors.budget?.min || errors.budget?.max) && (
            <p className={classes.error}>Budget range is required</p>
          )}
        </div>

        <Button
          type="primary"
          htmlType="submit"
          icon={<EditOutlined />}
          className={classes.submitButton}
        >
          Create Group
        </Button>
      </form>
    </div>
  );
};
