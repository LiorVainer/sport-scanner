import classes from './destination-section.module.scss';
import { Destination } from '@/models/packages/package.model.ts';
import { MatchDetails } from '@components/MatchDetails';
import { DestinationHeader } from './DestinationHeader';

export interface DestinationSectionProps {
    destination: Destination;
    variant?: 'full' | 'compact';
}

export const DestinationSection = ({ destination, variant }: DestinationSectionProps) => {
    return (
        <div className={classes.destinationSection}>
            <DestinationHeader destination={destination} />
            {destination.matches.map((match) => (
                <MatchDetails match={match} includeDivider variant={variant} />
            ))}
        </div>
    );
};
