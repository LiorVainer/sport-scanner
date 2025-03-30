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
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { MAX_PRICE, MIN_PRICE } from './SearchBarLogic';
import classes from './search-bar.module.scss';

const { RangePicker } = DatePicker;
const { Option } = Select;

// ----------------------
// Mock data for airports
// ----------------------
const originAirportsByCountry: Record<string, string[]> = {
  Spain: ['Madrid (MAD)', 'Barcelona (BCN)', 'Seville (SVQ)'],
  England: ['London Heathrow (LHR)', 'Manchester (MAN)', 'Birmingham (BHX)'],
  Germany: ['Frankfurt (FRA)', 'Berlin (BER)', 'Munich (MUC)'],
};

// ----------------------
// Zod form schema
// ----------------------
const SearchFormSchema = z.object({
  originCountry: z.string().optional(),
  originAirport: z.string().optional(),
  dateRange: z.any().optional(),
  priceRange: z.tuple([z.number(), z.number()]).optional(),
  country: z.string().optional(),
  league: z.string().optional(),
  team: z.string().optional(),
});

type SearchFormValues = z.infer<typeof SearchFormSchema>;

const DEFAULT_VALUES: SearchFormValues = {
  originCountry: undefined,
  originAirport: undefined,
  dateRange: null,
  priceRange: [MIN_PRICE, MAX_PRICE],
  country: undefined,
  league: undefined,
  team: undefined,
};

const SearchBar = () => {
  const [leagueId, setLeagueId] = useState<number>();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
  } = useForm<SearchFormValues>({
    defaultValues: DEFAULT_VALUES,
    resolver: zodResolver(SearchFormSchema),
  });

  const watchDateRange = watch('dateRange');
  const watchCountry = watch('country');
  const watchLeague = watch('league');
  const watchOriginCountry = watch('originCountry');

  const selectedDate = watchDateRange?.[0]?.toDate();

  const { data: countries = [] } = useQuery({
    queryKey: ['countries'],
    queryFn: SoccerService.getCountries,
  });

  const { data: leagues = [] } = useQueryOnDefinedParam(
    'leagues',
    watchCountry,
    SoccerService.getLeagues
  );

  const { data: teams = [] } = useQueryOnDefinedParam(
    'teams',
    leagueId && selectedDate
      ? { leagueId, season: calculateCurrentSeason(selectedDate) }
      : undefined,
    ({ leagueId, season }) => SoccerService.getTeams({ leagueId, season })
  );

  const onSubmit = (values: SearchFormValues) => {
    console.log('Submitted form data:', values);
  };

  return (
    <div className={classes.mainDiv}>
      <div className={classes.shadowDiv} />
      <div className={classes.titleDiv}>
        <h1 className={classes.mainTitle}>Find your next soccer experience</h1>
        <p className={classes.secondaryTitle}>
          View upcoming events, explore personalized packages, and more
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={classes.contentDiv}>
          {/* Origin Country */}
          <Controller
            name="originCountry"
            control={control}
            render={({ field }) => (
              <Select
                placeholder="Select Origin Country"
                className={classes.originCountry}
                {...field}
                suffixIcon={<EnvironmentOutlined />}
              >
                {countries.map((option) => (
                  <Option key={option.code} value={option.name}>
                    {option.name}
                  </Option>
                ))}
              </Select>
            )}
          />

          {/* Origin Airport */}
          <Controller
            name="originAirport"
            control={control}
            render={({ field }) => (
              <Select
                placeholder="Select Origin Airport"
                className={classes.originCountry}
                {...field}
                allowClear
                disabled={!watchOriginCountry}
              >
                {(originAirportsByCountry[watchOriginCountry as keyof typeof originAirportsByCountry] || []).map((airport) => (
                  <Option key={airport} value={airport}>
                    {airport}
                  </Option>
                ))}
              </Select>
            )}
          />

          {/* Date Range */}
          <Controller
            name="dateRange"
            control={control}
            render={({ field }) => (
              <RangePicker
                className={classes.dateRange}
                {...field}
                placeholder={['Start Date', 'End Date']}
                suffixIcon={<CalendarOutlined />}
              />
            )}
          />

          {/* Price Range */}
          <Controller
            name="priceRange"
            control={control}
            render={({ field }) => (
              <Select
                value={`${field.value?.[0]} - ${field.value?.[1]}`}
                className={classes.priceRange}
                suffixIcon={<DollarOutlined />}
                dropdownRender={() => (
                  <div style={{ padding: 12 }}>
                    <Slider
                      range
                      min={MIN_PRICE}
                      max={MAX_PRICE}
                      value={field.value}
                      onChange={(val) => field.onChange(val as [number, number])}
                      tooltip={{ formatter: (val) => `$${val}` }}
                    />
                  </div>
                )}
              >
                <Option value="budget">{`${field.value?.[0]} - ${field.value?.[1]}`}</Option>
              </Select>
            )}
          />

          {/* Destination Country */}
          <Controller
            name="country"
            control={control}
            render={({ field }) => (
              <Select
                placeholder="Select Country"
                className={classes.selectCountry}
                {...field}
                onChange={(val) => {
                  field.onChange(val);
                  setValue('league', '');
                  setValue('team', '');
                  setLeagueId(undefined);
                }}
                suffixIcon={<EnvironmentOutlined />}
              >
                {countries.map((option) => (
                  <Option key={option.code} value={option.name}>
                    {option.name}
                  </Option>
                ))}
              </Select>
            )}
          />

          {/* League */}
          <Controller
            name="league"
            control={control}
            render={({ field }) => (
              <Select
                placeholder="Select League"
                className={classes.selectLeague}
                {...field}
                disabled={!watchCountry}
                onChange={(val, option: any) => {
                  field.onChange(val);
                  setValue('team', '');
                  setLeagueId(option?.id);
                }}
                suffixIcon={<TrophyOutlined />}
              >
                {leagues.map((option) => (
                  <Option key={option.league.id} value={option.league.name} id={option.league.id}>
                    {option.league.name}
                  </Option>
                ))}
              </Select>
            )}
          />

          {/* Team */}
          <Controller
            name="team"
            control={control}
            render={({ field }) => (
              <Select
                placeholder="Select Team (Optional)"
                className={classes.selectTeam}
                {...field}
                allowClear
                disabled={!watchLeague || !selectedDate}
                suffixIcon={<TeamOutlined />}
              >
                {teams.map((option) => (
                  <Option key={option.team.id} value={option.team.name}>
                    {option.team.name}
                  </Option>
                ))}
              </Select>
            )}
          />

          {/* Search Button */}
          <Button type="primary" shape="round" size="large" htmlType="submit">
            Search
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
