import { Button, DatePicker, Input, Select, Slider } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import {
  UsergroupAddOutlined,
  CalendarOutlined,
  DollarOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import { useState, useEffect, useMemo } from 'react';
import classes from './add-group-screen.module.scss';
import { UsersService } from '@/api/services/users.service';
import { useQuery } from '@tanstack/react-query';

const { RangePicker } = DatePicker;

interface GroupFormValues {
  groupName: string;
  members: string[];
  tripDates: [string, string];
  budget: {
    min: number;
    max: number;
  };
}

export const AddGroupScreen = () => {
  const location = useLocation();
  const state = location.state as { group?: Partial<GroupFormValues> } | null;

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<GroupFormValues>({
    defaultValues: {
      groupName: state?.group?.groupName ?? '',
      members: state?.group?.members ?? [],
      tripDates: state?.group?.tripDates ?? ['', ''],
      budget: {
        min: state?.group?.budget?.min ?? 100,
        max: state?.group?.budget?.max ?? 1000,
      },
    },
  });

  const [searchTerm, setSearchTerm] = useState('');

  const { data: usersData = [] } = useQuery({
    queryKey: ['users', searchTerm],
    queryFn: () => UsersService.getUsers(searchTerm),
    enabled: !!searchTerm,
  });

  const userOptions = useMemo(
    () =>
      usersData.map((user: any) => ({
        label: user.username,
        value: user._id,
      })),
    [usersData]
  );

  const onSubmit = (data: GroupFormValues) => {
    console.log('Form submitted with data:', data);
  };

  return (
    <div className={classes.container}>
      <h1 className={classes.title}>Create Your Group for the Ultimate Sports Experience</h1>

      <form onSubmit={handleSubmit(onSubmit)} className={classes.form}>
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

        <div>
          <label className={classes.formTitle}>
            <DollarOutlined className={classes.icon} /> Budget Range per Person
          </label>
          <Controller
            name="budget"
            control={control}
            rules={{
              required: true,
              validate: (val) => val.min < val.max || 'Min must be less than Max',
            }}
            render={({ field }) => (
              <>
                <Slider
                  range
                  min={50}
                  max={5000}
                  step={10}
                  defaultValue={[field.value.min, field.value.max]}
                  onChange={(value) => {
                    const [min, max] = value;
                    field.onChange({ min, max });
                  }}
                  tooltip={{ formatter: (val) => `$${val}` }}
                />
                <div className={classes.budgetValues}>
                  <span>${field.value.min}</span>
                  <span>${field.value.max}</span>
                </div>
              </>
            )}
          />
          {errors.budget && (
            <p className={classes.error}>{errors.budget.message || 'Budget range is required'}</p>
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
