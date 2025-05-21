import { useState } from 'react';
import { AutoComplete, Button, message, Select } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { GeoService } from '@/api/services/geo.service';
import { SoccerService } from '@/api/services/soccer.service';
import { QUERY_KEYS } from '@/api/constants/query-keys.const';
import { UsersService } from '@/api/services/users.service';
import { useAuth } from '@/context/AuthContext';
import { DEFAULT_TEAMS, MIN_SEARCH_KEYWORD_LEN } from '@/components/FilterSearch/filter-search.const';
import './preferences-body-model.scss';
import classes from '@components/SearchBar/search-bar.module.scss';
import { MAX_ITEMS_PER_SELECT } from '@pages/UserPreferences/preferences-body.const.ts';

interface PreferencesBodyProps {
    handlePreferencesCancel: () => void;
    isFirstVisit?: boolean;
}

const PreferencesBody = ({ isFirstVisit, handlePreferencesCancel }: PreferencesBodyProps) => {
    const { loggedInUser } = useAuth();
    const queryClient = useQueryClient();

    const [homeAirportInput, setHomeAirportInput] = useState<string>();
    const [teamSearch, setTeamSearch] = useState('');
    const [leagueSearch, setLeagueSearch] = useState('');

    const { control, handleSubmit, resetField, setValue } = useForm({
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
            {isFirstVisit ? (
                <div>
                    <h2>Welcome To Sport Scanner!</h2>
                    <p className="intro">Please choose your preferences below to personalize your experience.</p>
                </div>
            ) : (
                <div>
                    <h3>Edit Your Preferences</h3>
                    <p className="intro">Choose your preferences below to personalize your experience.</p>
                </div>
            )}

            <div className="form-fields">
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
                        🏠 Home City or Airport *{' '}
                        <span>(Choose your home city or the airport you usually travel from)</span>
                    </label>
                    <Controller
                        rules={{ required: true }}
                        name="homeAirport"
                        control={control}
                        render={({ field, fieldState, formState }) => (
                            <>
                                <AutoComplete
                                    value={
                                        homeAirportInput ||
                                        (field.value ? `${field.value.name} (${field.value.iataCode})` : '')
                                    }
                                    onSearch={setHomeAirportInput}
                                    onSelect={(value) => {
                                        const selectedCity = airportSuggestions.find(
                                            (city) => `${city.name} (${city.iataCode})` === value
                                        );
                                        field.onChange(selectedCity || '');
                                        setHomeAirportInput(undefined);
                                    }}
                                    options={airportSuggestions.map((airport) => ({
                                        value: `${airport.name} (${airport.iataCode})`,
                                    }))}
                                    onClear={() => setValue('homeAirport', null)}
                                    placeholder="Start typing your city or airport"
                                    notFoundContent={isAirportLoading ? 'Loading...' : 'No matches'}
                                    allowClear
                                />
                                {formState.isSubmitted && fieldState.invalid && (
                                    <p className="error-message">Home city or airport is required</p>
                                )}
                            </>
                        )}
                    />
                </div>
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
