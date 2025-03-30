import React, { useState } from 'react';
import { DatePicker, Slider, Select, Button, AutoComplete } from 'antd';
import dayjs from 'dayjs';
import { EnvironmentOutlined, CalendarOutlined, TrophyOutlined, TeamOutlined, DollarOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useQueryOnDefinedParam } from '@api/hooks/service.query.ts';
import { SoccerService } from '@/api/services/soccer.service';
import { calculateCurrentSeason } from '@/utils/date.utils';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MAX_PRICE, MIN_PRICE } from './SearchBarLogic';
import classes from './search-bar.module.scss';
import { ROUTES } from '@/constants/routes.const';
import { useNavigate } from 'react-router';
import { GeoService } from '@/api/services/geo.service';
import { PackageGenerateParams, PackageGenerateParamsSchema } from '@/models/package.model';

const { RangePicker } = DatePicker;
const { Option } = Select;

const SearchBar = () => {
    const [leagueId, setLeagueId] = useState<number>();
    const [originKeyword, setOriginKeyword] = useState('');
    const navigate = useNavigate();

    const { data: airportSuggestions = [], isLoading: isAirportLoading } = useQuery({
        queryKey: ['originAirports', originKeyword],
        queryFn: async () => {
            if (originKeyword.length < 3 || originKeyword.length > 50) return [];
            return GeoService.getCities(originKeyword);
        },
        enabled: originKeyword.length >= 3 && originKeyword.length <= 50,
    });

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<PackageGenerateParams>({
        resolver: zodResolver(PackageGenerateParamsSchema),
        defaultValues: {
            originIATA: '',
            date: undefined,
            price: { min: MIN_PRICE, max: MAX_PRICE },
            league: undefined,
            team: undefined,
        },
    });

    console.log(errors);

    const watchDate = watch('date');
    const watchCountry = watch('country');
    const watchLeague = watch('league');

    const selectedDate = watchDate?.from;

    const { data: countries = [] } = useQuery({
        queryKey: ['countries'],
        queryFn: GeoService.getCountries,
    });

    const { data: leagues = [] } = useQueryOnDefinedParam('leagues', watchCountry, SoccerService.getLeagues);

    const { data: teams = [] } = useQueryOnDefinedParam(
        'teams',
        leagueId && selectedDate ? { leagueId, season: calculateCurrentSeason(new Date(selectedDate)) } : undefined,
        ({ leagueId, season }) => SoccerService.getTeams({ leagueId, season })
    );

    const onSubmit = (values: PackageGenerateParams) => {
        console.log('Submitted form data:', values);

        navigate(`${ROUTES.PACKAGES}/results`, { state: values });
    };

    return (
        <div className={classes.mainDiv}>
            <div className={classes.shadowDiv} />
            <div className={classes.titleDiv}>
                <h1 className={classes.mainTitle}>Find your next soccer experience</h1>
                <p className={classes.secondaryTitle}>View upcoming events, explore personalized packages, and more</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className={classes.contentDiv}>
                    <Controller
                        name="originIATA"
                        control={control}
                        render={({ field }) => (
                            <AutoComplete
                                {...field}
                                allowClear
                                className={classes.originCountry}
                                placeholder="Select Origin Airport"
                                onSearch={(value) => setOriginKeyword(value)}
                                onSelect={(value) => {
                                    // This will only store the IATA code (value passed from the select handler)
                                    const selectedCity = airportSuggestions.find(
                                        (city) => `${city.name} (${city.iataCode})` === value
                                    );
                                    field.onChange(selectedCity?.iataCode || ''); // Store only the IATA code
                                }}
                                options={airportSuggestions.map((city) => ({
                                    value: `${city.name} (${city.iataCode})`, // Show name and IATA code
                                }))}
                                notFoundContent={isAirportLoading ? 'Loading...' : 'No matches'}
                            />
                        )}
                    />

                    <Controller
                        name="date"
                        control={control}
                        render={({ field }) => (
                            <RangePicker
                                className={classes.dateRange}
                                onChange={(dates) => {
                                    field.onChange(
                                        dates && dates[0] && dates[1]
                                            ? { from: dates[0].toISOString(), to: dates[1].toISOString() }
                                            : undefined
                                    );
                                }}
                                value={field.value ? [dayjs(field.value.from), dayjs(field.value.to)] : undefined}
                                placeholder={['Start Date', 'End Date']}
                                suffixIcon={<CalendarOutlined />}
                            />
                        )}
                    />

                    <Controller
                        name="price"
                        control={control}
                        render={({ field }) => (
                            <Select
                                value={`${field.value?.min} - ${field.value?.max}`}
                                className={classes.priceRange}
                                suffixIcon={<DollarOutlined />}
                                dropdownRender={() => (
                                    <div style={{ padding: 12 }}>
                                        <Slider
                                            range
                                            min={MIN_PRICE}
                                            max={MAX_PRICE}
                                            value={[field.value?.min ?? MIN_PRICE, field.value?.max ?? MAX_PRICE]}
                                            onChange={(val) => field.onChange({ min: val[0], max: val[1] })}
                                            tooltip={{ formatter: (val) => `$${val}` }}
                                        />
                                    </div>
                                )}
                            >
                                <Option value="budget">{`${field.value?.min} - ${field.value?.max}`}</Option>
                            </Select>
                        )}
                    />

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
                                    setValue('league', undefined);
                                    setValue('team', undefined);
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
                                    setValue('team', undefined);
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

                    <Button type="primary" shape="round" size="large" htmlType="submit">
                        Search
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default SearchBar;
