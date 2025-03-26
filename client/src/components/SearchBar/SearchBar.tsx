import React, { useState } from 'react';
import { DatePicker, Slider, Select, Button, Space, Card } from 'antd';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

type OptionType = { label: string; value: string };
type RangeValue<T> = [T | null, T | null] | null;

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
  const [dateRange, setDateRange] = useState<RangeValue<dayjs.Dayjs>>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([100, 1000]);
  const [country, setCountry] = useState<string | undefined>();
  const [league, setLeague] = useState<string | undefined>();
  const [team, setTeam] = useState<string | undefined>();

  const handleSearch = () => {
    console.log({ dateRange, priceRange, country, league, team });
    // Call API or navigate with these filters
  };

  return (
    <Card style={{ borderRadius: 16, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <RangePicker style={{ width: '100%' }} onChange={setDateRange} />

        <Slider
          range
          min={0}
          max={5000}
          defaultValue={priceRange}
          onChange={(val) => setPriceRange(val as [number, number])}
          tooltip={{ formatter: (val) => `$${val}` }}
        />

        <Select
          placeholder="Select Country"
          style={{ width: '100%' }}
          options={countryOptions}
          onChange={(val) => {
            setCountry(val);
            setLeague(undefined);
            setTeam(undefined);
          }}
          value={country}
        />

        <Select
          placeholder="Select League"
          style={{ width: '100%' }}
          disabled={!country}
          options={leagueOptionsByCountry[country || ''] || []}
          onChange={(val) => {
            setLeague(val);
            setTeam(undefined);
          }}
          value={league}
        />

        <Select
          placeholder="Select Team (Optional)"
          style={{ width: '100%' }}
          disabled={!league}
          allowClear
          options={teamOptionsByLeague[league || ''] || []}
          onChange={setTeam}
          value={team}
        />

        <Button type="primary" size="large" block onClick={handleSearch}>
          Search
        </Button>
      </Space>
    </Card>
  );
};

export default SearchBar;
