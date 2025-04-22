import React, { useEffect, useState } from 'react';
import { Select, Button, Spin, message, AutoComplete } from 'antd';
import './preferences-body-model.scss';
import { useQuery } from '@tanstack/react-query';
import { GeoService } from '@/api/services/geo.service';
import { SoccerService } from '@/api/services/soccer.service';
import { MAX_KEYWORD_LEN, MIN_KEYWORD_LEN } from '@/components/SearchBar';
import { Team, Venue } from '@/types/soccer.types';

const { Option } = Select;
const MAX_ITEMS_PER_SELECT = 3;

const PreferencesBody: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [favoriteTeams, setFavoriteTeams] = useState<string[]>([]);
    const [preferredLeagues, setPreferredLeagues] = useState<string[]>([]);
    const [homeAirportInput, setHomeAirportInput] = useState<string>('');
    const [homeAirport, setHomeAirport] = useState<string>('');
    const [teamSearch, setTeamSearch] = useState('');
    const [leagueSearch, setLeagueSearch] = useState('');
    const [defaultTeams, setDefaultTeams] = useState<{ team: Team; venue: Venue }[]>([]);

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
        const fetchUserPreferences = async () => {
            try {
                const res = await fetch('/api/user/preferences');
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                const data = await res.json();
                setFavoriteTeams(data.favoriteTeams || []);
                setPreferredLeagues(data.preferredLeagues || []);
                setHomeAirport(data.homeAirport || '');
            } catch (error) {
                console.error('Failed to fetch preferences', error);
                message.error('Failed to load preferences');
            } finally {
                setLoading(false);
            }
        };

        fetchUserPreferences();
    }, []);

    const handleSave = async () => {
        try {
            await fetch('/api/user/preferences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ favoriteTeams, preferredLeagues, homeAirport }),
            });
            message.success('Preferences saved successfully!');
        } catch (error) {
            console.error('Failed to save preferences', error);
            message.error('Failed to save preferences');
        }
    };

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

    if (loading) {
        return (
            <div className="user-preferences-loading">
                <Spin size="large" />
            </div>
        );
    }

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
                    onChange={(value) => setHomeAirportInput(value)}
                    onSelect={(value) => {
                        const selected = airportSuggestions.find(
                            (airport) => `${airport.name} (${airport.iataCode})` === value
                        );
                        setHomeAirportInput(value);
                        setHomeAirport(selected?.iataCode || '');
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
                <Button type="primary" onClick={handleSave}>
                    Save
                </Button>
            </div>
        </div>
    );
};

export default PreferencesBody;
