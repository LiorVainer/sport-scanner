import { Typography, Avatar, Tooltip } from 'antd';
import { CalendarOutlined, DollarOutlined } from '@ant-design/icons';
import { Package } from '@/models/packages/package.model';
import { PublicUser } from '@/models/user.model.ts';

import { MatchDetails } from '@/components/MatchDetails/MatchDetails';
import styles from './group-container.module.scss';

const { Title, Text } = Typography;

interface GroupContainerProps {
  groupName: string;
  members: PublicUser[];
  travelPackage: Package;
}

export const GroupContainer = ({ groupName, members, travelPackage }: GroupContainerProps) => {
  const { startDate, endDate, totalPrice, timeline } = travelPackage;
  const destinations = timeline.filter((item) => item.type === 'destination');
  const matches = destinations.flatMap((dest) => dest.matches);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.groupInfo}>
          <Title level={4}>{groupName}</Title>
          <div className={styles.metaInfo}>
            <Text><DollarOutlined /> {totalPrice.min}$ - {totalPrice.max}$</Text>
            <Text><CalendarOutlined /> {startDate} → {endDate}</Text>
          </div>
        </div>
        <div className={styles.avatars}>
          {members.map((member) => (
            <Tooltip key={member._id} title={member.username}>
              <Avatar src={member.picture} />
            </Tooltip>
          ))}
        </div>
      </div>
      <div className={styles.matchList}>
        <MatchDetails match={matches[0]} />
            <span className={styles.arrow}>→</span>
        <MatchDetails match={matches[1]} />
      </div>
    </div>
  );
};
