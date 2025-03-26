import classes from './match-details.module.scss';
import { MatchExperience } from '@/models/match-experience.model.ts';
import { Calendar, MapPin, Trophy } from 'lucide-react';
import moment from 'moment';

export interface MatchDetailsProps {
    matchExperience: MatchExperience;
}

const MAX_TEAM_NAME_LENGTH = 20;
const displayTeamName = (teamName: string) => {
    if (teamName.length > MAX_TEAM_NAME_LENGTH) {
        return `${teamName.slice(0, MAX_TEAM_NAME_LENGTH)}...`;
    } else {
        return teamName;
    }
};

export const MatchDetails = ({ matchExperience }: MatchDetailsProps) => {
    return (
        <div className={classes.matchDetails}>
            <div className={classes.teams}>
                <span>{displayTeamName(matchExperience.homeTeam)}</span>
                <span>vs</span>
                <span>{displayTeamName(matchExperience.awayTeam)}</span>
            </div>
            <div className={classes.matchMeta}>
                <div>
                    <Trophy size={20} />
                    <span>{matchExperience.league}</span>
                </div>
                <div>
                    <MapPin size={20} />
                    <span>
                        {matchExperience.stadium}, {matchExperience.country}
                    </span>
                </div>
                <div>
                    <Calendar size={20} />
                    <span>{moment(matchExperience.matchDate).format('MMMM D, YYYY')}</span>
                </div>
            </div>
        </div>
    );
};
