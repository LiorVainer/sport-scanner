import { ExtendedFixtureItem } from '../../models/soccer/fixture.model';
import { FlightOffer } from '../../models/flights/flight-offer.model';
import { CoreMessage } from 'ai';
import { IntroContextMessageGenerator } from './intro.message';
import { FixtureContextMessagesGenerator } from './fixture.message';
import { FlightContextMessageGenerator } from './flight.message';
import { RulesContextMessageGenerator } from './rules.message';
import { AgentManipulationContextMessageGenerator } from './agent-manipulation.message';
import { FreeTextToPackageParamsMessageGenerator } from './free-text-to-package-params.messgae';

export const PackagesContextMessagesGenerator = {
    create: (
        fixtures: ExtendedFixtureItem[],
        flightOffers: FlightOffer[],
        maxPackages: number,
        originIataCode: string
    ): CoreMessage[] => [
        IntroContextMessageGenerator.create(),
        FixtureContextMessagesGenerator.itemsArrayIntro(),
        ...FixtureContextMessagesGenerator.itemsArray(fixtures),
        FlightContextMessageGenerator.itemsArrayIntro(),
        ...FlightContextMessageGenerator.itemsArray(flightOffers, fixtures, originIataCode),
        RulesContextMessageGenerator.create(maxPackages),
        AgentManipulationContextMessageGenerator.create(),
    ],

    createWithFreeText: (freeText: string): CoreMessage[] => [FreeTextToPackageParamsMessageGenerator.create(freeText)],
};
