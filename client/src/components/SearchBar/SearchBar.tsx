import React, { useState } from 'react';
import { Input, DatePicker, Slider, Select, Button } from 'antd';
import dayjs from 'dayjs';
import {
  EnvironmentOutlined,
  CalendarOutlined,
  DollarOutlined,
  TrophyOutlined,
  TeamOutlined,
} from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Option } = Select;

type RangeValue<T> = [T | null, T | null] | null;
type OptionType = { label: string; value: string };

const countryOptions: OptionType[] = [
  { label: 'Spain', value: 'spain' },
  { label: 'England', value: 'england' },
  { label: 'Germany', value: 'germany' },
];

const leagueOptionsByCountry: Record<string, OptionType[]> = {
  spain: [{ label: 'La Liga', value: 'la_liga' }],
  england: [{ label: 'Premier League', value: 'premier_league' }],
  germany: [{ label: 'Bundesliga', value: 'bundesliga' }],
};

const teamOptionsByLeague: Record<string, OptionType[]> = {
  la_liga: [
    { label: 'Barcelona', value: 'barcelona' },
    { label: 'Real Madrid', value: 'real_madrid' },
  ],
  premier_league: [
    { label: 'Arsenal', value: 'arsenal' },
    { label: 'Liverpool', value: 'liverpool' },
  ],
  bundesliga: [
    { label: 'Bayern Munich', value: 'bayern' },
    { label: 'Dortmund', value: 'dortmund' },
  ],
};

const SearchBar: React.FC = () => {
  const [location, setLocation] = useState<string>();
  const [dateRange, setDateRange] = useState<RangeValue<dayjs.Dayjs>>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([100, 1000]);
  const [country, setCountry] = useState<string>();
  const [league, setLeague] = useState<string>();
  const [team, setTeam] = useState<string>();

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
        maxWidth: 1200,
        overflow: 'hidden',
        textAlign: 'center',
      }}
    >
      {/* Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          borderRadius: 24,
          zIndex: 0,
        }}
      />

      {/* Hero Text */}
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

      {/* Filters */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          justifyContent: 'center',
          zIndex: 1,
          position: 'relative',
        }}
      >
        <Select
          placeholder="Select Location"
          style={{ borderRadius: 32, width: 220 }}
          value={location}
          onChange={(val) => setLocation(val)}
          suffixIcon={<EnvironmentOutlined />}
        >
          {countryOptions.map((c) => (
            <Option key={c.value} value={c.value}>
              {c.label}
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
          onClick={() => {}}
          dropdownRender={() => (
            <div style={{ padding: 12 }}>
              <Slider
                range
                min={0}
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
            setLeague(undefined);
            setTeam(undefined);
          }}
          suffixIcon={<EnvironmentOutlined />}
        >
          {countryOptions.map((c) => (
            <Option key={c.value} value={c.value}>
              {c.label}
            </Option>
          ))}
        </Select>

        <Select
          placeholder="Select League"
          style={{ borderRadius: 5, width: 200, backgroundColor:  'grey' }}
          value={league}
          onChange={(val) => {
            setLeague(val);
            setTeam(undefined);
          }}
          disabled={!country}
          suffixIcon={<TrophyOutlined />}
        >
          {(leagueOptionsByCountry[country || ''] || []).map((l) => (
            <Option key={l.value} value={l.value}>
              {l.label}
            </Option>
          ))}
        </Select>

        <Select
          placeholder="Select Team (Optional)"
          style={{ borderRadius: 5, width: 200, backgroundColor:  'grey' }}
          value={team}
          onChange={setTeam}
          disabled={!league}
          allowClear
          suffixIcon={<TeamOutlined />}
        >
          {(teamOptionsByLeague[league || ''] || []).map((t) => (
            <Option key={t.value} value={t.value}>
              {t.label}
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
