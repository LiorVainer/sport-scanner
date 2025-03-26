import { MatchExperience } from '@/models/match-experience.model';
import moment from 'moment';
import classes from './user-info.module.scss';
import { getPictureSrcUrl } from '@/utils/picture.utils';

interface UserInfoProps {
    user: MatchExperience['user'];
}

export const UserInfo = ({ user }: UserInfoProps) => {
    return (
        <div className={classes.user}>
            {user && <img src={getPictureSrcUrl(user.picture)} alt={user.username} className={classes.userAvatar} />}
            <div className={classes.userMeta}>
                <div>
                    <p className={classes.username}>{user.username}</p>
                    <p className={classes.email}>{user.email}</p>
                </div>
                <p className={classes.contentTime}>joined {moment(user.createdAt).fromNow()}</p>
            </div>
        </div>
    );
};
