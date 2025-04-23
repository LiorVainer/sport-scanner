import { Team, Venue } from '@/types/soccer.types';

export const DEFAULT_TEAMS: { team: Team; venue: Venue }[] = [
  {
    team: {
      id: 541,
      name: 'Real Madrid',
      code: 'REA',
      country: 'Spain',
      founded: 1902,
      logo: 'https://media.api-sports.io/football/teams/541.png',
      national: false,
    },
    venue: {
      id: 1456,
      name: 'Estadio Santiago Bernabéu',
      address: 'Avenida de Concha Espina 1, Chamartín',
      city: 'Madrid',
      capacity: 85454,
      surface: 'grass',
      image: 'https://media.api-sports.io/football/venues/1456.png',
    },
  },
  {
    team: {
      id: 529,
      name: 'Barcelona',
      code: 'BAR',
      country: 'Spain',
      founded: 1899,
      logo: 'https://media.api-sports.io/football/teams/529.png',
      national: false,
    },
    venue: {
      id: 19939,
      name: 'Estadi Olímpic Lluís Companys',
      address: "Carrer de l'Estadi",
      city: 'Barcelona',
      capacity: 55926,
      surface: 'grass',
      image: 'https://media.api-sports.io/football/venues/19939.png',
    },
  },
  {
    team: {
      id: 50,
      name: 'Manchester City',
      code: 'MAC',
      country: 'England',
      founded: 1880,
      logo: 'https://media.api-sports.io/football/teams/50.png',
      national: false,
    },
    venue: {
      id: 555,
      name: 'Etihad Stadium',
      address: 'Rowsley Street',
      city: 'Manchester',
      capacity: 55097,
      surface: 'grass',
      image: 'https://media.api-sports.io/football/venues/555.png',
    },
  },
  {
    team: {
      id: 489,
      name: 'AC Milan',
      code: 'MIL',
      country: 'Italy',
      founded: 1899,
      logo: 'https://media.api-sports.io/football/teams/489.png',
      national: false,
    },
    venue: {
      id: 907,
      name: 'Stadio Giuseppe Meazza',
      address: 'Via Piccolomini 5',
      city: 'Milano',
      capacity: 80018,
      surface: 'grass',
      image: 'https://media.api-sports.io/football/venues/907.png',
    },
  },
  {
    team: {
      id: 492,
      name: 'Napoli',
      code: 'NAP',
      country: 'Italy',
      founded: 1904,
      logo: 'https://media.api-sports.io/football/teams/492.png',
      national: false,
    },
    venue: {
      id: 11904,
      name: 'Stadio Diego Armando Maradona',
      address: 'Pizzale Vincenzo Tecchio',
      city: 'Napoli',
      capacity: 60240,
      surface: 'grass',
      image: 'https://media.api-sports.io/football/venues/11904.png',
    },
  },
];


export const MIN_KEYWORD_LEN = 3;
export const MAX_KEYWORD_LEN = 50;

export const topFootballCountries: string[] = ['Spain', 'England', 'Germany', 'Italy', 'France'];
export const teamNames = ['Real Madrid', 'Barcelona', 'Manchester City', 'AC Milan', 'Napoli'];

export const MAX_TEAMS_LIMIT = 5;