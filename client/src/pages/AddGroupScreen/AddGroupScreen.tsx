import { Button, DatePicker, Form, Input } from 'antd';
import { UsergroupAddOutlined, CalendarOutlined, DollarOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import classes from './add-group-screen.module.scss';

const { RangePicker } = DatePicker;

export const AddGroupScreen = () => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log('Group data:', values);
  };

  return (
    <div className={classes.container}>
      <h1 className={classes.title}>Create Your Group for the Ultimate Sports Experience</h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className={classes.form}
      >
        <Form.Item
          label={<span className={classes.formTitle} ><UsergroupAddOutlined className={classes.icon}/> Group Name</span>}
          name="groupName"
          rules={[{ required: true, message: 'Please enter a group name' }]}
        >
          <Input  className={classes.input} placeholder="Enter your group name (e.g., Weekend Football Fans)" />
        </Form.Item>

        <Form.Item
          label={<span className={classes.formTitle}><UsergroupAddOutlined className={classes.icon}/> Group Members</span>}
          name="members"
        >
          <Input className={classes.input} placeholder="Mention wanted group members usernames (e.g., @Lior Vainer, @Rom Pollak)" />
        </Form.Item>

        <Form.Item
          label={<span className={classes.formTitle}><CalendarOutlined className={classes.icon}/> Preferred Trip Dates</span>}
          name="tripDates"
        >
          <RangePicker
            format="YYYY-MM-DD"
            placeholder={['e.g., 2024-01-10', 'e.g., 2024-01-15']}
            className={classes.dateRange}
          />
        </Form.Item>

        <Form.Item
          label={<span className={classes.formTitle}><DollarOutlined className={classes.icon}/> Budget Range per Person</span>}
          className={classes.budgetRow}
        >
          <div className={classes.budgetInputs}>
            <Form.Item name={['budget', 'min']} noStyle>
              <Input className={classes.input} placeholder="e.g., 100$" />
            </Form.Item>
            <span className={classes.arrow}>→</span>
            <Form.Item name={['budget', 'max']} noStyle>
              <Input className={classes.input} placeholder="e.g., 100$" />
            </Form.Item>
          </div>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<EditOutlined />} className={classes.submitButton}>
            Create Group
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
