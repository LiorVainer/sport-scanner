import React, { useState } from 'react';
import { DatePicker, Slider, Select, Button, AutoComplete, message, Form } from 'antd';
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
    const [countryNameSearch, setCountryNameSearch] = useState<string | undefined>(undefined);
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
        formState: { errors, isValid },
        resetField,
    } = useForm<PackageGenerateParams>({
        resolver: zodResolver(PackageGenerateParamsSchema),
        defaultValues: {
            originIATA: '',
            date: undefined,
            price: { min: MIN_PRICE, max: MAX_PRICE },
            league: undefined,
            team: undefined,
            country: undefined,
        },
    });

    console.log(errors);

    const watchDate = watch('date');
    const watchCountry = watch('country');
    const watchLeague = watch('league');
    const selectedDate = watchDate?.from;

    const { data: countries = [] } = useQuery({
        queryKey: ['countries', countryNameSearch],
        queryFn: () => GeoService.getCountries(countryNameSearch),
        enabled: !!countryNameSearch,
    });

    const { data: leagues = [] } = useQueryOnDefinedParam(
        'leagues',
        watchCountry && !countryNameSearch ? watchCountry : undefined,
        SoccerService.getLeagues
    );

    const { data: teams = [] } = useQueryOnDefinedParam(
        'teams',
        leagueId && selectedDate ? { leagueId, season: calculateCurrentSeason(new Date(selectedDate)) } : undefined,
        ({ leagueId, season }) => SoccerService.getTeams({ leagueId, season })
    );

    const onSubmit = async (values: PackageGenerateParams) => {
        const { country, ...formValues } = values;
        console.log('Submitted form data:', formValues);
        localStorage.setItem('formValues', JSON.stringify(formValues));
        navigate(`${ROUTES.PACKAGES}/results`);
    };

    return (
        <div className={classes.mainDiv}>
            <div className={classes.shadowDiv} />
            <div className={classes.titleDiv}>
                <h1 className={classes.mainTitle}>Find your next soccer experience</h1>
                <p className={classes.secondaryTitle}>View upcoming events, explore personalized packages, and more</p>
            </div>

            <Form layout="vertical" className={classes.contentDiv} onFinish={handleSubmit(onSubmit)}>
                <Form.Item>
                    <Controller
                        name="originIATA"
                        control={control}
                        render={({ field }) => (
                            <AutoComplete
                                {...field}
                                allowClear
                                className={classes.originAirport}
                                placeholder="Select Origin Airport"
                                onSearch={(value) => setOriginKeyword(value)}
                                onSelect={(value) => {
                                    const selectedCity = airportSuggestions.find(
                                        (city) => `${city.name} (${city.iataCode})` === value
                                    );
                                    field.onChange(selectedCity?.iataCode || '');
                                }}
                                options={airportSuggestions.map((city) => ({
                                    value: `${city.name} (${city.iataCode})`,
                                }))}
                                notFoundContent={isAirportLoading ? 'Loading...' : 'No matches'}
                            />
                        )}
                    />
                </Form.Item>
                <Form.Item>
                    <Controller
                        name="date"
                        control={control}
                        render={({ field }) => (
                            <RangePicker
                                className={classes.dateRange}
                                onChange={(dates) => {
                                    field.onChange(
                                        dates && dates[0] && dates[1]
                                            ? { from: dates[0].format('YYYY-MM-DD'), to: dates[1].format('YYYY-MM-DD') }
                                            : undefined
                                    );
                                }}
                                value={field.value ? [dayjs(field.value.from), dayjs(field.value.to)] : undefined}
                                placeholder={['Start Date', 'End Date']}
                                suffixIcon={<CalendarOutlined />}
                                disabledDate={(current) => current && current < dayjs().startOf('day')}
                            />
                        )}
                    />
                </Form.Item>
                <Form.Item>
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
                </Form.Item>
                <Form.Item>
                    <Controller
                        name="country"
                        control={control}
                        render={({ field }) => (
                            <AutoComplete
                                {...field}
                                allowClear
                                className={classes.selectCountry}
                                placeholder="Select Country"
                                onSearch={(value) => setCountryNameSearch(value)}
                                onSelect={(value) => {
                                    setCountryNameSearch(undefined);
                                    resetField('league');
                                    resetField('team');
                                    field.onChange(value);
                                }}
                                options={countries.map((country) => ({
                                    value: country.name,
                                }))}
                                notFoundContent={isAirportLoading ? 'Loading...' : 'No matches'}
                                suffixIcon={<EnvironmentOutlined />}
                            />
                        )}
                    />
                </Form.Item>

                <Form.Item>
                    <Controller
                        name="league"
                        control={control}
                        render={({ field }) => (
                            <Select
                                placeholder="Select League"
                                className={classes.selectLeague}
                                {...field}
                                disabled={!Boolean(watchCountry && !countryNameSearch)}
                                value={field.value} // Store the league id
                                onChange={(val, option: any) => {
                                    console.log({ val, option });
                                    field.onChange(val); // Store league.id
                                    resetField('team'); // Reset the team field
                                    setLeagueId(val); // Set the leagueId for fetching teams
                                }}
                                suffixIcon={<TrophyOutlined />}
                            >
                                {leagues.map((option) => (
                                    <Option key={option.league.id} value={option.league.id}>
                                        {option.league.name} {/* Show the league name */}
                                    </Option>
                                ))}
                            </Select>
                        )}
                    />
                </Form.Item>
                <Form.Item>
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
                                value={field.value} // Store the team id
                                onChange={(val, option: any) => {
                                    field.onChange(val); // Store team.id
                                }}
                                suffixIcon={<TeamOutlined />}
                            >
                                {teams.map((option) => (
                                    <Option key={option.team.id} value={option.team.id}>
                                        {option.team.name} {/* Show the team name */}
                                    </Option>
                                ))}
                            </Select>
                        )}
                    />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" shape="round" size="large" htmlType="submit" disabled={!isValid}>
                        Search
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default SearchBar;
