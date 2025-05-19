import { Button, DatePicker, Input } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import { UsergroupAddOutlined, CalendarOutlined, DollarOutlined, EditOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import classes from './add-group-screen.module.scss';

const { RangePicker } = DatePicker;

interface GroupFormValues {
  groupName: string;
  members: string;
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
      members: state?.group?.members ?? '',
      tripDates: state?.group?.tripDates ?? ['', ''],
      budget: {
        min: state?.group?.budget?.min ?? '',
        max: state?.group?.budget?.max ?? '',
      },
    },
  });

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
            render={({ field }) => (
              <Input {...field} className={classes.input} placeholder="Mention usernames (e.g., @Rom Pollak)" />
            )}
          />
        </div>

        <div>
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
        </div>

        <div>
          <label className={classes.formTitle}>
            <DollarOutlined className={classes.icon} /> Budget Range per Person
          </label>
          <div className={classes.budgetInputs}>
            <Controller
              name="budget.min"
              control={control}
              render={({ field }) => (
                <Input {...field} className={classes.input} placeholder="e.g., 100$" />
              )}
            />
            <span className={classes.arrow}>→</span>
            <Controller
              name="budget.max"
              control={control}
              render={({ field }) => (
                <Input {...field} className={classes.input} placeholder="e.g., 1000$" />
              )}
            />
          </div>
        </div>

        <Button type="primary" htmlType="submit" icon={<EditOutlined />} className={classes.submitButton}>
          Create Group
        </Button>
      </form>
    </div>
  );
};
