export type Country = { name: string; code: string; flag: string };
export type League = { id: number; name: string; type: string; logo: string };
export type Venue = {
    id: number;
    name: string;
    address: string;
    city: string;
    country: string;
    capacity: number;
    surface: string;
    image: string;
};
export type Team = {
    id: number;
    name: string;
    code: string;
    country: string;
    founded: number;
    national: boolean;
    logo: string;
};
