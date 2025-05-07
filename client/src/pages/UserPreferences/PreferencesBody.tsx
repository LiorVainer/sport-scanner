import React, { useState } from 'react';
import { AutoComplete, Button, message, Select } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { GeoService } from '@/api/services/geo.service';
import { SoccerService } from '@/api/services/soccer.service';
import { QUERY_KEYS } from '@/api/constants/query-keys.const';
import { UsersService } from '@/api/services/users.service';
import { useAuth } from '@/context/AuthContext';
import { FavoriteLeague, FavoriteTeam } from '@/models/packages/package.model';
import { DEFAULT_TEAMS, MIN_AIRPORT_SEARCH_KEYWORD_LEN } from '@components/SearchBar/search-bar.const.ts';
import './preferences-body-model.scss';

const MAX_ITEMS_PER_SELECT = 3;

interface PreferencesBodyProps {
    handlePreferencesCancel: () => void;
}

const PreferencesBody = ({ handlePreferencesCancel }: PreferencesBodyProps) => {
    const { loggedInUser } = useAuth();
    const queryClient = useQueryClient();

    const [homeAirportInput, setHomeAirportInput] = useState<string>('');
    const [teamSearch, setTeamSearch] = useState('');
    const [leagueSearch, setLeagueSearch] = useState('');

    const { control, handleSubmit, setValue } = useForm({
        defaultValues: {
            favoriteTeams: loggedInUser?.favoriteTeams ?? [],
            favoriteLeagues: loggedInUser?.favoriteLeagues ?? [],
            homeAirport: loggedInUser?.homeAirport ?? null,
        },
    });

    const { data: airportSuggestions = [], isLoading: isAirportLoading } = useQuery({
        queryKey: ['originAirports', homeAirportInput],
        queryFn: () => GeoService.getCities(homeAirportInput),
        enabled: homeAirportInput.length >= MIN_AIRPORT_SEARCH_KEYWORD_LEN,
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

    const { mutateAsync: updateUser } = useMutation({
        mutationKey: [QUERY_KEYS.UPDATE_USER],
        mutationFn: async (data: any) => {
            return await UsersService.updateUser(loggedInUser!._id, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LOGGED_IN_USER] });
            message.success('Preferences saved successfully!');
            handlePreferencesCancel();
        },
    });

    const onSubmit = async (values: any) => {
        await updateUser({
            favoriteTeams: values.favoriteTeams,
            favoriteLeagues: values.favoriteLeagues,
            homeAirport: values.homeAirport,
            isFirstVisit: false,
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="user-preferences">
            <p className="intro">Update your preferences below:</p>

            <div className="form-group">
                <label>
                    🏆 Favorite Teams <span>(Tell us which teams you love to follow)</span>
                </label>
                <Controller
                    name="favoriteTeams"
                    control={control}
                    render={({ field }) => (
                        <Select
                            mode="multiple"
                            showSearch
                            style={{ width: '100%' }}
                            placeholder={`Type to search teams (max ${MAX_ITEMS_PER_SELECT})`}
                            maxTagCount={3}
                            onSearch={setTeamSearch}
                            options={
                                teamSearch.length >= 3
                                    ? searchedTeams.map((team) => ({
                                          label: (
                                              <div className="team-item">
                                                  <img src={team.logo} alt={team.name} />
                                                  {team.name}
                                              </div>
                                          ),
                                          value: JSON.stringify({ id: team.id, name: team.name }),
                                      }))
                                    : DEFAULT_TEAMS.map((team) => ({
                                          label: (
                                              <div className="team-item">
                                                  <img src={team.logo} alt={team.name} />
                                                  {team.name}
                                              </div>
                                          ),
                                          value: JSON.stringify({ id: team.id, name: team.name }),
                                      }))
                            }
                            value={field.value.map((t: FavoriteTeam) => JSON.stringify(t))}
                            onChange={(values) => {
                                if (values.length > MAX_ITEMS_PER_SELECT) {
                                    message.warning(`You can select up to ${MAX_ITEMS_PER_SELECT} teams.`);
                                } else {
                                    const parsedValues = values.map((v) => JSON.parse(v));
                                    setValue('favoriteTeams', parsedValues);
                                }
                            }}
                            filterOption={false}
                        />
                    )}
                />
            </div>

            <div className="form-group">
                <label>
                    🏆 Preferred Leagues <span>(Select leagues that excite you the most)</span>
                </label>
                <Controller
                    name="favoriteLeagues"
                    control={control}
                    render={({ field }) => (
                        <Select
                            mode="multiple"
                            showSearch
                            style={{ width: '100%' }}
                            placeholder={`Type to search leagues (max ${MAX_ITEMS_PER_SELECT})`}
                            maxTagCount={3}
                            onSearch={setLeagueSearch}
                            options={searchedLeagues.map((league) => ({
                                label: (
                                    <div className="team-item">
                                        <img src={league.league.logo} alt={league.league.name} />
                                        {league.league.name}
                                    </div>
                                ),
                                value: JSON.stringify({ id: league.league.id, name: league.league.name }),
                            }))}
                            value={field.value.map((l: FavoriteLeague) => JSON.stringify(l))}
                            onChange={(values) => {
                                if (values.length > MAX_ITEMS_PER_SELECT) {
                                    message.warning(`You can select up to ${MAX_ITEMS_PER_SELECT} leagues.`);
                                } else {
                                    const parsedValues = values.map((v) => JSON.parse(v));
                                    setValue('favoriteLeagues', parsedValues);
                                }
                            }}
                            filterOption={false}
                        />
                    )}
                />
            </div>

            <div className="form-group">
                <label>
                    🏠 Home City or Airport <span>(Choose your home city or the airport you usually travel from)</span>
                </label>
                <Controller
                    name="homeAirport"
                    control={control}
                    render={({ field }) => (
                        <AutoComplete
                            value={homeAirportInput}
                            onSearch={setHomeAirportInput}
                            onSelect={(value) => {
                                const selected = airportSuggestions.find(
                                    (airport) => `${airport.name} (${airport.iataCode})` === value
                                );
                                field.onChange(selected);
                                setHomeAirportInput(value);
                            }}
                            options={airportSuggestions.map((airport) => ({
                                value: `${airport.name} (${airport.iataCode})`,
                            }))}
                            style={{ width: '100%' }}
                            placeholder="Start typing your city or airport"
                            notFoundContent={isAirportLoading ? 'Loading...' : 'No matches'}
                            allowClear
                        />
                    )}
                />
            </div>

            <div className="save-btn">
                <Button type="primary" htmlType="submit">
                    Save
                </Button>
            </div>
        </form>
    );
};

export default PreferencesBody;
