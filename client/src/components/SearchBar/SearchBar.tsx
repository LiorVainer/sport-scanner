import React, { useState } from 'react';
import { DatePicker, Slider, Select, Button } from 'antd';
import dayjs from 'dayjs';
import {
  EnvironmentOutlined,
  CalendarOutlined,
  DollarOutlined,
  TrophyOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useQueryOnDefinedParam } from '@api/hooks/service.query.ts';
import { SoccerService } from '@/api/services/soccer.service';
import { calculateCurrentSeason } from '@/utils/date.utils';

const { RangePicker } = DatePicker;
const { Option } = Select;

type RangeValue<T> = [T | null, T | null] | null;

const MIN_PRICE = 100;
const MAX_PRICE = 1000;

const SearchBar = () => {
  const [location, setLocation] = useState<string>();
  const [dateRange, setDateRange] = useState<RangeValue<dayjs.Dayjs>>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([MIN_PRICE, MAX_PRICE]);
  const [country, setCountry] = useState<string>();
  const [league, setLeague] = useState<string>();
  const [leagueId, setLeagueId] = useState<number>();
  const [team, setTeam] = useState<string>();

  const selectedDate = dateRange?.[0]?.toDate();

  const { data: countries = [] } = useQuery({
    queryKey: ['countries'],
    queryFn: SoccerService.getCountries,
  });

  const { data: leagues = [] } = useQueryOnDefinedParam(
    'leagues',
    country,
    SoccerService.getLeagues
  );

  const { data: teams = [] } = useQueryOnDefinedParam(
    'teams',
    leagueId && selectedDate
      ? { leagueId, season: calculateCurrentSeason(selectedDate) }
      : undefined,
    ({ leagueId, season }) => SoccerService.getTeams({ leagueId, season })
  );

  const handleSearch = () => {
    console.log({ location, dateRange, priceRange, country, league, team });
  };

  return (
    <div
      style={{
        position: 'relative',
        backgroundImage: 'url("/stadium.avif")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: 24,
        padding: '64px 24px',
        margin: '0 auto',
        overflow: 'hidden',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          borderRadius: 24,
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          color: '#fff',
          marginBottom: 40,
        }}
      >
        <h1 style={{ fontSize: 36, fontWeight: 'bold', margin: 0 }}>
          Find your next soccer experience
        </h1>
        <p style={{ fontSize: 16, marginTop: 8 }}>
          View upcoming events, explore personalized packages, and more
        </p>
      </div>

      <div
        style={{
          backgroundColor: 'rgb(187, 187, 187)',
          borderRadius: 50,
          padding: '12px 24px',
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Select
          placeholder="Select Location"
          style={{ borderRadius: 32, width: 220 }}
          value={location}
          onChange={(val) => setLocation(val)}
          suffixIcon={<EnvironmentOutlined />}
        >
          {countries.map((c) => (
            <Option key={c.code} value={c.name}>
              {c.name}
            </Option>
          ))}
        </Select>

        <RangePicker
          style={{ borderRadius: 5, width: 220 }}
          onChange={setDateRange}
          placeholder={['Start Date', 'End Date']}
          suffixIcon={<CalendarOutlined />}
        />

        <Select
          value={`${priceRange[0]} - ${priceRange[1]}`}
          style={{ borderRadius: 32, width: 180 }}
          suffixIcon={<DollarOutlined />}
          dropdownRender={() => (
            <div style={{ padding: 12 }}>
              <Slider
                range
                min={MIN_PRICE}
                max={5000}
                value={priceRange}
                onChange={(val) => setPriceRange(val as [number, number])}
                tooltip={{ formatter: (val) => `$${val}` }}
              />
            </div>
          )}
        >
          <Option value="budget">{`${priceRange[0]} - ${priceRange[1]}`}</Option>
        </Select>

        <Select
          placeholder="Select Country"
          style={{ borderRadius: 32, width: 200 }}
          value={country}
          onChange={(val) => {
            setCountry(val);
            setLeague('');
            setTeam('');
            setLeagueId(undefined);
          }}
          suffixIcon={<EnvironmentOutlined />}
        >
          {countries.map((c) => (
            <Option key={c.code} value={c.name}>
              {c.name}
            </Option>
          ))}
        </Select>

        <Select
          placeholder="Select League"
          style={{ borderRadius: 5, width: 200, backgroundColor: 'grey' }}
          value={league}
          onChange={(val, option: any) => {
            setLeague(val);
            setTeam('');
            setLeagueId(option?.id);
          }}
          disabled={!country}
          suffixIcon={<TrophyOutlined />}
        >
          {leagues.map((l) => (
            <Option key={l.league.id} value={l.league.name} id={l.league.id}>
              {l.league.name}
            </Option>
          ))}
        </Select>

        <Select
          placeholder="Select Team (Optional)"
          style={{ borderRadius: 5, width: 200, backgroundColor: 'grey' }}
          value={team}
          onChange={setTeam}
          disabled={!league || !selectedDate}
          allowClear
          suffixIcon={<TeamOutlined />}
        >
          {teams.map((t) => (
            <Option key={t.team.id} value={t.team.name}>
              {t.team.name}
            </Option>
          ))}
        </Select>

        <Button type="primary" shape="round" size="large" onClick={handleSearch}>
          Search
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;
