import { ROUTES } from '@/constants/routes.const';
import { Button } from 'antd';
import { useNavigate } from 'react-router';
import { EditOutlined } from '@ant-design/icons';
import { Package } from '@/models/packages/package.model';
import { PublicUser } from '@/models/user.model';
import classes from './groups-screen.module.scss';
import { GroupCard } from '@/components/GroupCard/GroupCard';
import { Group } from '@/models/group.model';

export const mockGroups: Group[] = [
  // ✅ Group with 2 matches
  {
    title: 'Double Match Madness',
    users: [
      {
        _id: '1',
        username: 'Leo',
        email: 'leo@test.com',
        picture: 'https://randomuser.me/api/portraits/men/32.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: '2',
        username: 'Mbappe',
        email: 'mbappe@test.com',
        picture: 'https://randomuser.me/api/portraits/men/33.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    selectedPackage: {
      title: 'Epic Double Match Trip',
      description: 'Two matches across Europe!',
      startDate: '2025-05-10',
      endDate: '2025-05-20',
      location: 'Europe',
      flightsPrice: 600,
      matchesPrice: { min: 80, max: 250 },
      totalPrice: { min: 680, max: 950 },
      timeline: [
        {
          type: 'destination',
          city: 'Rome',
          cityIataCode: 'FCO',
          startDate: '2025-05-10',
          endDate: '2025-05-14',
          matches: [
            {
              id: 1,
              timezone: '+00:00',
              date: '2025-05-12T18:00:00+00:00',
              timestamp: 1715536800,
              league: {
                id: 1,
                name: 'Serie A',
                logo: 'https://media.api-sports.io/football/leagues/135.png',
                round: 'Round 35',
              },
              homeTeam: {
                id: 101,
                name: 'AS Roma',
                logo: 'https://media.api-sports.io/football/teams/497.png',
              },
              awayTeam: {
                id: 102,
                name: 'Lazio',
                logo: 'https://media.api-sports.io/football/teams/489.png',
              },
              stadium: { name: 'Stadio Olimpico', city: 'Rome' },
              price: { min: 80, max: 230 },
              searchMatchTicketsLink: 'https://www.stubhub.com',
            },
          ],
        },
        {
          type: 'destination',
          city: 'London',
          cityIataCode: 'LHR',
          startDate: '2025-05-14',
          endDate: '2025-05-20',
          matches: [
            {
              id: 2,
              timezone: '+00:00',
              date: '2025-05-18T20:00:00+00:00',
              timestamp: 1716052800,
              league: {
                id: 2,
                name: 'Premier League',
                logo: 'https://media.api-sports.io/football/leagues/39.png',
                round: 'Matchday 38',
              },
              homeTeam: {
                id: 201,
                name: 'Arsenal',
                logo: 'https://media.api-sports.io/football/teams/42.png',
              },
              awayTeam: {
                id: 202,
                name: 'Chelsea',
                logo: 'https://media.api-sports.io/football/teams/49.png',
              },
              stadium: { name: 'Emirates Stadium', city: 'London' },
              price: { min: 90, max: 250 },
              searchMatchTicketsLink: 'https://www.stubhub.com',
            },
          ],
        },
      ],
      metadata: {
        destinationsCount: 2,
        flightsCount: 2,
        matchesCount: 2,
        citiesVisited: ['Rome', 'London'],
        durationDays: 10,
        averageMatchTicketPrice: 165,
        destinations: [],
      },
    },
  },

  // ✅ Group with 1 match
  {
    title: 'Rome Football Break',
    users: [
      {
        _id: '4',
        username: 'Neymar',
        email: 'ney@test.com',
        picture: 'https://randomuser.me/api/portraits/men/35.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    selectedPackage: {
      title: 'Single Match Trip to Rome',
      description: 'Short break to Rome with a Serie A classic.',
      startDate: '2025-06-01',
      endDate: '2025-06-04',
      location: 'Rome',
      flightsPrice: 300,
      matchesPrice: { min: 50, max: 120 },
      totalPrice: { min: 350, max: 420 },
      timeline: [
        {
          type: 'destination',
          city: 'Rome',
          cityIataCode: 'FCO',
          startDate: '2025-06-01',
          endDate: '2025-06-04',
          matches: [
            {
              id: 3,
              timezone: '+00:00',
              date: '2025-06-02T17:00:00+00:00',
              timestamp: 1717347600,
              league: {
                id: 135,
                name: 'Serie A',
                logo: 'https://media.api-sports.io/football/leagues/135.png',
                round: 'Final Round',
              },
              homeTeam: {
                id: 497,
                name: 'AS Roma',
                logo: 'https://media.api-sports.io/football/teams/497.png',
              },
              awayTeam: {
                id: 501,
                name: 'Juventus',
                logo: 'https://media.api-sports.io/football/teams/496.png',
              },
              stadium: { name: 'Stadio Olimpico', city: 'Rome' },
              price: { min: 50, max: 120 },
              searchMatchTicketsLink: 'https://www.stubhub.com',
            },
          ],
        },
      ],
      metadata: {
        destinationsCount: 1,
        flightsCount: 1,
        matchesCount: 1,
        citiesVisited: ['Rome'],
        durationDays: 3,
        averageMatchTicketPrice: 85,
        destinations: [],
      },
    },
  },

  // ✅ Group with 0 matches
  {
    title: 'Relax Trip - No Football',
    users: [
      {
        _id: '5',
        username: 'Messi',
        email: 'messi@test.com',
        picture: 'https://randomuser.me/api/portraits/men/36.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    selectedPackage: {
      title: 'Beach Getaway in Corfu',
      description: 'Pure relaxation in Greece. No matches.',
      startDate: '2025-07-10',
      endDate: '2025-07-15',
      location: 'Corfu',
      flightsPrice: 280,
      matchesPrice: { min: 0, max: 0 },
      totalPrice: { min: 280, max: 280 },
      timeline: [
        {
          type: 'destination',
          city: 'Corfu',
          cityIataCode: 'CFU',
          startDate: '2025-07-10',
          endDate: '2025-07-15',
          matches: [], // No matches
        },
      ],
      metadata: {
        destinationsCount: 1,
        flightsCount: 1,
        matchesCount: 0,
        citiesVisited: ['Corfu'],
        durationDays: 5,
        averageMatchTicketPrice: 0,
        destinations: [],
      },
    },
  },
];


export const GroupsScreen = () => {
  const navigate = useNavigate();

  const handleNewGroup = () => {
    navigate(ROUTES.ADD_GROUP);
  };

  // navigate(ROUTES.ADD_GROUP, { // in ido page
  //   state: {
  //     group: {
  //       groupName: 'UEFA Lovers',
  //       members: '@Rom Pollak, @Lior Vainer',
  //       tripDates: ['2025-06-01', '2025-06-10'],
  //       budget: { min: '300', max: '900' }
  //     }
  //   }
  // });

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <h1 className={classes.pageTitle}>Your Groups</h1>
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={handleNewGroup}
          className={classes.addButton}
        >
          Create New Group
        </Button>
      </div>

      {mockGroups.map((group, idx) => (
        <GroupCard key={idx} group={group} />
      ))}
    </div>
  );
};
