import { Package } from "@/models/packages/package.model";

export const mockData: {
	title: string;
	users: {
	  _id: string;
	  username: string;
	  email: string;
	  picture: string;
	  createdAt: Date;
	  updatedAt: Date;
	}[];
	selectedPackage: Package;
  } = {
	title: 'The Best Traveling Group',
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
	  {
		_id: '3',
		username: 'Vinicius',
		email: 'vini@test.com',
		picture: 'https://randomuser.me/api/portraits/men/34.jpg',
		createdAt: new Date(),
		updatedAt: new Date(),
	  },
	],
	selectedPackage: {
	  id: 1,
	  title: 'Epic Double Match Trip: Roma & Manchester',
	  description: 'Catch two thrilling games across Italy and England!',
	  startDate: '2025-05-15',
	  endDate: '2025-05-24',
	  location: 'Europe',
	  flightsPrice: 720,
	  matchesPrice: { min: 70, max: 280 },
	  totalPrice: { min: 790, max: 1000 },
	  timeline: [
		{
		  type: 'destination',
		  city: 'Roma',
		  cityIataCode: 'FCO',
		  startDate: '2025-05-15',
		  endDate: '2025-05-21',
		  matches: [
			{
			  id: 1223964,
			  timezone: '+00:00',
			  date: '2025-05-18T13:00:00+00:00',
			  timestamp: 1716037200,
			  league: {
				id: 135,
				name: 'Serie A',
				logo: 'https://media.api-sports.io/football/leagues/135.png',
				round: 'Regular Season - 37',
			  },
			  homeTeam: {
				id: 497,
				name: 'AS Roma',
				logo: 'https://media.api-sports.io/football/teams/497.png',
			  },
			  awayTeam: {
				id: 489,
				name: 'AC Milan',
				logo: 'https://media.api-sports.io/football/teams/489.png',
			  },
			  stadium: {
				name: 'Stadio Olimpico',
				city: 'Roma',
			  },
			  price: { min: 70, max: 250 },
			  searchMatchTicketsLink:
				'https://www.stubhub.com/search?q=AS%20Roma%20vs%20AC%20Milan%202025-05-18',
			},
		  ],
		},
		{
		  type: 'destination',
		  city: 'Manchester',
		  cityIataCode: 'MAN',
		  startDate: '2025-05-17',
		  endDate: '2025-05-24',
		  matches: [
			{
			  id: 1208391,
			  timezone: '+00:00',
			  date: '2025-05-20T19:00:00+00:00',
			  timestamp: 1716222000,
			  league: {
				id: 39,
				name: 'Premier League',
				logo: 'https://media.api-sports.io/football/leagues/39.png',
				round: 'Regular Season - 37',
			  },
			  homeTeam: {
				id: 50,
				name: 'Manchester City',
				logo: 'https://media.api-sports.io/football/teams/50.png',
			  },
			  awayTeam: {
				id: 35,
				name: 'Bournemouth',
				logo: 'https://media.api-sports.io/football/teams/35.png',
			  },
			  stadium: {
				name: 'Etihad Stadium',
				city: 'Manchester',
			  },
			  price: { min: 90, max: 280 },
			  searchMatchTicketsLink:
				'https://www.stubhub.com/search?q=Manchester%20City%20vs%20Bournemouth%202025-05-20',
			},
		  ],
		},
	  ],
	  metadata: {
		destinationsCount: 2,
		flightsCount: 2,
		matchesCount: 2,
		citiesVisited: ['Roma', 'Manchester'],
		durationDays: 9,
		averageMatchTicketPrice: 170,
		destinations: [],
	  },
	},
  };