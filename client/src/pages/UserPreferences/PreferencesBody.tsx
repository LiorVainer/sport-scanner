import React, { useEffect, useState } from 'react';
import { Select, Button, Spin, message } from 'antd';
import './preferences-body-model.scss';
import { useQuery } from '@tanstack/react-query';
import { useQueryOnDefinedParam } from '@/api/hooks/service.query';
import { GeoService } from '@/api/services/geo.service';
import { SoccerService } from '@/api/services/soccer.service';

const { Option } = Select;

const allTeams = ['FC Barcelona', 'FC Bayern Munich', 'Manchester United', 'Real Madrid'];
const allLeagues = ['La Liga', 'Premier League', 'Serie A', 'League 1'];
const allAirports = ['Tel Aviv (TLV)', 'JFK Airport, New York', 'London Heathrow (LHR)'];

const PreferencesBody: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [favoriteTeams, setFavoriteTeams] = useState<string[]>([]);
    const [preferredLeagues, setPreferredLeagues] = useState<string[]>([]);
    const [homeAirport, setHomeAirport] = useState<string | undefined>();
    const [teams, setTeams] = useState<String[]>([]);
    const [leagues, setLeagues] = useState<String[]>([]);
    const [airports, setAirports] = useState<String[]>([]);

    const MAX_ITEMS_PER_SELECT = 3;

    const handleTeamChange = (value: string[]) => {
        if (value.length <= MAX_ITEMS_PER_SELECT) {
            setFavoriteTeams(value);
        } else {
            message.warning('You can select up to 3 teams only.');
        }
    };

    const handleLeagueChange = (value: string[]) => {
        if (value.length <= MAX_ITEMS_PER_SELECT) {
            setPreferredLeagues(value);
        } else {
            message.warning('You can select up to 3 leagues only.');
        }
    };

    useEffect(() => {
        const fetchUserPreferences = async () => {
            try {
                const res = await fetch('/api/user/preferences');
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

        const fetchData = async () => {
            const allTeams = await SoccerService.getTeams;
            const allLeagues = await SoccerService.getLeagues;
            const allAirports = await GeoService.getCities;
        };

        fetchData();
        fetchUserPreferences();
    }, []);

    const handleSave = async () => {
        try {
            await fetch('/api/user/preferences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    favoriteTeams,
                    preferredLeagues,
                    homeAirport,
                }),
            });
            message.success('Preferences saved successfully!');
        } catch (error) {
            console.error('Failed to save preferences', error);
            message.error('Failed to save preferences');
        }
    };

    if (loading) {
        return (
            <div className="user-preferences-loading">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="user-preferences">
            <p className="intro">Update your preferences below:</p>

            <div className="form-group">
                <label>
                    🏆 Favorite Teams <span>(Tell us which teams you love to follow)</span>
                </label>
                <Select
                    mode="multiple"
                    style={{ width: '100%' }}
                    placeholder="Select teams"
                    value={favoriteTeams}
                    onChange={handleTeamChange}
                >
                    {allTeams.map((team) => (
                        <Option key={team} value={team}>
                            {team}
                        </Option>
                    ))}
                </Select>
            </div>

            <div className="form-group">
                <label>
                    🏆 Preferred Leagues <span>(Select leagues that excite you the most)</span>
                </label>
                <Select
                    mode="multiple"
                    style={{ width: '100%' }}
                    placeholder="Select leagues"
                    value={preferredLeagues}
                    onChange={handleLeagueChange}
                >
                    {allLeagues.map((league) => (
                        <Option key={league} value={league}>
                            {league}
                        </Option>
                    ))}
                </Select>
            </div>

            <div className="form-group">
                <label>
                    🏠 Home City or Airport <span>(Choose your home city or the airport you usually travel from)</span>
                </label>
                <Select
                    showSearch
                    style={{ width: '100%' }}
                    placeholder="Enter your city or airport"
                    value={homeAirport}
                    onChange={(value) => setHomeAirport(value)}
                >
                    {allAirports.map((airport) => (
                        <Option key={airport} value={airport}>
                            {airport}
                        </Option>
                    ))}
                </Select>
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
