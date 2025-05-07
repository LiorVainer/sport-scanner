import { useState } from 'react';
import { AutoComplete, Button, message, Select } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { GeoService } from '@/api/services/geo.service';
import { SoccerService } from '@/api/services/soccer.service';
import { QUERY_KEYS } from '@/api/constants/query-keys.const';
import { UsersService } from '@/api/services/users.service';
import { useAuth } from '@/context/AuthContext';
import { DEFAULT_TEAMS, MIN_SEARCH_KEYWORD_LEN } from '@components/SearchBar/search-bar.const.ts';
import './preferences-body-model.scss';
import classes from '@components/SearchBar/search-bar.module.scss';

const MAX_ITEMS_PER_SELECT = 3;

interface PreferencesBodyProps {
    handlePreferencesCancel: () => void;
}

const PreferencesBody = ({ handlePreferencesCancel }: PreferencesBodyProps) => {
    const { loggedInUser } = useAuth();
    const queryClient = useQueryClient();

    const [homeAirportInput, setHomeAirportInput] = useState<string>();
    const [teamSearch, setTeamSearch] = useState('');
    const [leagueSearch, setLeagueSearch] = useState('');

    const { control, handleSubmit, watch, resetField, setValue } = useForm({
        defaultValues: {
            favoriteTeams: loggedInUser?.favoriteTeams ?? [],
            favoriteLeagues: loggedInUser?.favoriteLeagues ?? [],
            homeAirport: loggedInUser?.homeAirport ?? null,
        },
    });

    const { data: airportSuggestions = [], isLoading: isAirportLoading } = useQuery({
        queryKey: ['originAirports', homeAirportInput],
        queryFn: () => GeoService.getCities(homeAirportInput!),
        enabled: !!homeAirportInput && homeAirportInput.length >= MIN_SEARCH_KEYWORD_LEN,
    });

    console.log({ homeAirportInput, watch: watch().homeAirport });

    const { data: searchedTeamsResults = [] } = useQuery({
        queryKey: ['teams', teamSearch],
        queryFn: () => SoccerService.getTeams(teamSearch),
        enabled: teamSearch.length >= MIN_SEARCH_KEYWORD_LEN,
    });

    const { data: searchedLeaguesResults = [] } = useQuery({
        queryKey: ['leagues', leagueSearch],
        queryFn: () => SoccerService.getLeaguesByName(leagueSearch),
        enabled: leagueSearch.length >= MIN_SEARCH_KEYWORD_LEN,
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
                            labelInValue
                            placeholder={`Type to search teams (max ${MAX_ITEMS_PER_SELECT})`}
                            style={{ width: '100%' }}
                            maxTagCount={3}
                            onSearch={setTeamSearch}
                            options={(!teamSearch ? DEFAULT_TEAMS : searchedTeamsResults).map((team) => ({
                                value: team.name,
                                label: (
                                    <div className={classes.teamItem}>
                                        <img src={team.logo} alt={team.name} />
                                        {team.name}
                                    </div>
                                ),
                            }))}
                            value={
                                field.value?.map((team) => ({
                                    value: team.name,
                                    label: (
                                        <div className={classes.teamItem}>
                                            <img src={team.logo} alt={team.name} />
                                            {team.name}
                                        </div>
                                    ),
                                })) ?? []
                            }
                            onChange={(selectedOptions) => {
                                if (selectedOptions.length > MAX_ITEMS_PER_SELECT) {
                                    message.warning(`You can select up to ${MAX_ITEMS_PER_SELECT} teams.`);
                                    return;
                                }

                                const selectedNames = selectedOptions.map((opt) => opt.value);

                                const teamsArr = !teamSearch ? DEFAULT_TEAMS : searchedTeamsResults;

                                const newSelections = selectedNames
                                    .map((val) => teamsArr.find((t) => t.name === val))
                                    .filter(Boolean)
                                    .map((team) => ({
                                        id: team!.id,
                                        name: team!.name,
                                        logo: team!.logo,
                                    }));

                                const prevSelections = field.value ?? [];
                                const merged = [
                                    ...prevSelections.filter((team) => selectedNames.includes(team.name)),
                                    ...newSelections.filter((t) => !prevSelections.some((p) => p.id === t.id)),
                                ];

                                field.onChange(merged);
                            }}
                            onClear={() => {
                                resetField('favoriteTeams');
                                setTeamSearch('');
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
                            labelInValue
                            placeholder={`Type to search leagues (max ${MAX_ITEMS_PER_SELECT})`}
                            style={{ width: '100%' }}
                            maxTagCount={3}
                            onSearch={setLeagueSearch}
                            options={searchedLeaguesResults.map((league) => ({
                                value: league.league.name,
                                label: (
                                    <div className={classes.teamItem}>
                                        <img src={league.league.logo} alt={league.league.name} />
                                        {league.league.name}
                                    </div>
                                ),
                            }))}
                            value={
                                field.value?.map((league) => ({
                                    value: league.name,
                                    label: (
                                        <div className={classes.teamItem}>
                                            <img src={league.logo} alt={league.name} />
                                            {league.name}
                                        </div>
                                    ),
                                })) ?? []
                            }
                            onChange={(selectedOptions) => {
                                if (selectedOptions.length > MAX_ITEMS_PER_SELECT) {
                                    message.warning(`You can select up to ${MAX_ITEMS_PER_SELECT} leagues.`);
                                    return;
                                }

                                const selectedNames = selectedOptions.map((opt) => opt.value);

                                const leaguesArr = !leagueSearch ? [] : searchedLeaguesResults.map((l) => l.league);

                                const newSelections = selectedNames
                                    .map((val) => leaguesArr.find((l) => l.name === val))
                                    .filter(Boolean)
                                    .map((league) => ({
                                        id: league!.id,
                                        name: league!.name,
                                        logo: league!.logo,
                                    }));

                                const prevSelections = field.value ?? [];
                                const merged = [
                                    ...prevSelections.filter((league) => selectedNames.includes(league.name)),
                                    ...newSelections.filter((t) => !prevSelections.some((p) => p.id === t.id)),
                                ];

                                field.onChange(merged);
                            }}
                            onClear={() => {
                                resetField('favoriteLeagues');
                                setLeagueSearch('');
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
                    rules={{ required: true }}
                    name="homeAirport"
                    control={control}
                    render={({ field }) => (
                        <AutoComplete
                            value={
                                homeAirportInput || (field.value ? `${field.value.name} (${field.value.iataCode})` : '')
                            }
                            onSearch={setHomeAirportInput}
                            onSelect={(value) => {
                                const selectedCity = airportSuggestions.find(
                                    (city) => `${city.name} (${city.iataCode})` === value
                                );
                                field.onChange(selectedCity || '');
                                setHomeAirportInput(undefined);
                            }}
                            style={{ width: '100%' }}
                            options={airportSuggestions.map((airport) => ({
                                value: `${airport.name} (${airport.iataCode})`,
                            }))}
                            onClear={() => setValue('homeAirport', null)}
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
