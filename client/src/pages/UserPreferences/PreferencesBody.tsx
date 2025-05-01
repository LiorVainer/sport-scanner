import React, { useEffect, useState } from 'react';
import { Select, Button, message, AutoComplete } from 'antd';
import './preferences-body-model.scss';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { GeoService } from '@/api/services/geo.service';
import { SoccerService } from '@/api/services/soccer.service';
import { MAX_KEYWORD_LEN, MIN_KEYWORD_LEN } from '@/components/SearchBar';
import { Team, Venue } from '@/types/soccer.types';
import { QUERY_KEYS } from '@/api/constants/query-keys.const';
import { UsersService } from '@/api/services/users.service';
import { UserPreferencesPayload } from '@/models/user.model';
import { useAuth } from '@/context/AuthContext';
import { CityInfo } from '@/models/packages/package.model';

const MAX_ITEMS_PER_SELECT = 3;

interface PreferencesBodyProps {
    handlePreferencesCancel: () => void;
}

const PreferencesBody = ({ handlePreferencesCancel }: PreferencesBodyProps) => {
    const { loggedInUser } = useAuth();

    const [favoriteTeams, setFavoriteTeams] = useState<string[]>([]);
    const [preferredLeagues, setPreferredLeagues] = useState<string[]>([]);
    const [homeAirportInput, setHomeAirportInput] = useState<string>('');
    const [homeAirport, setHomeAirport] = useState<CityInfo>();
    const [teamSearch, setTeamSearch] = useState('');
    const [leagueSearch, setLeagueSearch] = useState('');
    const [defaultTeams, setDefaultTeams] = useState<{ team: Team; venue: Venue }[]>([]);
    const queryClient = useQueryClient();

    const { data: airportSuggestions = [], isLoading: isAirportLoading } = useQuery({
        queryKey: ['originAirports', homeAirportInput],
        queryFn: async () => {
            if (homeAirportInput.length < MIN_KEYWORD_LEN || homeAirportInput.length > MAX_KEYWORD_LEN) return [];
            return GeoService.getCities(homeAirportInput);
        },
        enabled: homeAirportInput.length >= MIN_KEYWORD_LEN && homeAirportInput.length <= MAX_KEYWORD_LEN,
    });

    const { data: searchedTeams = [] } = useQuery({
        queryKey: ['teams', teamSearch],
        queryFn: () => SoccerService.getTeams(teamSearch),
        enabled: teamSearch.length >= 3,
    });

    const { data: searchedLeagues = [] } = useQuery({
        queryKey: ['leagues', leagueSearch],
        queryFn: () => SoccerService.getLeaguesByName(leagueSearch),
        enabled: leagueSearch.length >= 3,
    });

    useEffect(() => {
        const fetchDefaults = async () => {
            const teamNames = ['Real Madrid', 'Barcelona', 'Manchester City', 'AC Milan', 'Napoli'];
            const fetched = await Promise.all(
                teamNames.map(async (name) => {
                    const teams = await SoccerService.getTeams(name);
                    return teams[0] ?? null;
                })
            );
            setDefaultTeams(fetched.filter(Boolean) as { team: Team; venue: Venue }[]);
        };
        fetchDefaults();
    }, []);

    useEffect(() => {
        setFavoriteTeams(loggedInUser!.favoriteTeams || []);
        setPreferredLeagues(loggedInUser!.preferredLeagues || []);

        if (loggedInUser!.homeAirport) {
            setHomeAirport(loggedInUser!.homeAirport);
            setHomeAirportInput(`${loggedInUser!.homeAirport.name} (${loggedInUser!.homeAirport.iataCode})`);
        }
    }, []);

    const { mutateAsync } = useMutation({
        mutationKey: [QUERY_KEYS.UPDATE_USER],
        mutationFn: async () => {
            return await UsersService.updateUser(loggedInUser!._id, {
                favoriteTeams,
                preferredLeagues,
                homeAirport,
                isFirstVisit: false,
            } as UserPreferencesPayload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LOGGED_IN_USER] });
            message.success('Preferences saved successfully!');
            handlePreferencesCancel();
        },
    });

    const handleTeamChange = (value: string[]) => {
        if (value.length <= MAX_ITEMS_PER_SELECT) {
            setFavoriteTeams(value);
        } else {
            message.warning(`You can select up to ${MAX_ITEMS_PER_SELECT} teams.`);
        }
    };

    const handleLeagueChange = (value: string[]) => {
        if (value.length <= MAX_ITEMS_PER_SELECT) {
            setPreferredLeagues(value);
        } else {
            message.warning(`You can select up to ${MAX_ITEMS_PER_SELECT} leagues.`);
        }
    };

    const isHomeAirportValid = homeAirport?.iataCode && homeAirport?.name;

    const teamOptions =
        teamSearch.length < 3
            ? defaultTeams.map((t) => ({ value: t.team.name }))
            : searchedTeams.map((t) => ({ value: t.team.name }));

    const leagueOptions = searchedLeagues.map((l) => ({ value: l.league.name }));

    return (
        <div className="user-preferences">
            <p className="intro">Update your preferences below:</p>

            <div className="form-group">
                <label>
                    🏆 Favorite Teams <span>(Tell us which teams you love to follow)</span>
                </label>
                <Select
                    mode="multiple"
                    showSearch
                    style={{ width: '100%' }}
                    placeholder="Type to search teams (max 3)"
                    value={favoriteTeams}
                    onSearch={setTeamSearch}
                    onChange={handleTeamChange}
                    options={teamOptions}
                    filterOption={false}
                />
            </div>

            <div className="form-group">
                <label>
                    🏆 Preferred Leagues <span>(Select leagues that excite you the most)</span>
                </label>
                <Select
                    mode="multiple"
                    showSearch
                    style={{ width: '100%' }}
                    placeholder="Type to search leagues (max 3)"
                    value={preferredLeagues}
                    onSearch={setLeagueSearch}
                    onChange={handleLeagueChange}
                    options={leagueOptions}
                    filterOption={false}
                />
            </div>

            <div className="form-group">
                <label>
                    🏠 Home City or Airport <span>(Choose your home city or the airport you usually travel from)</span>
                </label>
                <AutoComplete
                    value={homeAirportInput}
                    onSearch={setHomeAirportInput}
                    onChange={(value) => {
                        setHomeAirportInput(value);
                    
                        if (!value) {
                            setHomeAirport(undefined);
                        }
                    }}
                    onSelect={(value) => {
                        const selected = airportSuggestions.find(
                            (airport) => `${airport.name} (${airport.iataCode})` === value
                        );
                        setHomeAirportInput(value);
                        if (selected) {
                            setHomeAirport({
                                name: selected.name,
                                iataCode: selected.iataCode || '',
                            });
                        } else {
                            setHomeAirport({ name: '', iataCode: '' });
                        }
                    }}
                    options={airportSuggestions.map((airport) => ({
                        value: `${airport.name} (${airport.iataCode})`,
                    }))}
                    style={{ width: '100%' }}
                    placeholder="Start typing your city or airport"
                    notFoundContent={isAirportLoading ? 'Loading...' : 'No matches'}
                    allowClear
                />
            </div>

            <div className="save-btn">
                <Button
                    type="primary"
                    onClick={async () => {
                        if (!isHomeAirportValid) {
                            message.error('Please select a valid home city or airport from the suggestions.');
                            return;
                        }
                        await mutateAsync();
                    }}
                >
                    Save
                </Button>
            </div>
        </div>
    );
};

export default PreferencesBody;
