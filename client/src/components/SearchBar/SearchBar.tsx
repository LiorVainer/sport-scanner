import React, { useRef } from 'react';
import { AutoComplete, Button, DatePicker, Form, Select, Slider } from 'antd';
import dayjs from 'dayjs';
import {
    CalendarOutlined,
    CloseCircleOutlined,
    DollarOutlined,
    EnvironmentOutlined,
    SearchOutlined,
    TeamOutlined,
    TrophyOutlined,
} from '@ant-design/icons';
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
import { usePackages } from '@/context/PackagesContext';
import { useLocalStorage } from '@/hooks/useLocalStorage.hooks';
import {
    PackagesGenerationParams,
    PackagesGenerationParamsSchema,
} from '@/models/packages/package-generate-params.model.ts';

const { RangePicker } = DatePicker;
const { Option } = Select;

const MIN_KEYWORD_LEN = 3;
const MAX_KEYWORD_LEN = 50;

const calcDefaultGenerateParams: () => PackagesGenerationParams = () => {
    const today = dayjs();
    const inTwoWeeks = today.add(2, 'weeks');

    return {
        originIATA: '',
        date: {
            from: today.format('YYYY-MM-DD'),
            to: inTwoWeeks.format('YYYY-MM-DD'),
        },
        price: { min: MIN_PRICE, max: MAX_PRICE },
        league: undefined,
        team: undefined,
        country: undefined,
    };
};

const SearchBar = () => {
    const defaultGenerateParamsRef = useRef(calcDefaultGenerateParams());
    const [originKeyword, setOriginKeyword] = React.useState('');
    const [countryNameSearch, setCountryNameSearch] = React.useState<string | undefined>(undefined);
    const [leagueNameSearch, setLeagueNameSearch] = React.useState<string | undefined>(undefined);
    const [teamNameSearch, setTeamNameSearch] = React.useState<string | undefined>(undefined);


    const navigate = useNavigate();
    const { fetchPackages } = usePackages();

    const [storedSearchParams, setStoredSearchParams] = useLocalStorage<PackagesGenerationParams>(
        'searchParams',
        defaultGenerateParamsRef.current
    );

    const {
        control,
        handleSubmit,
        watch,
        formState: { isValid, isDirty },
        reset,
        resetField,
    } = useForm<PackagesGenerationParams>({
        resolver: zodResolver(PackagesGenerationParamsSchema),
        defaultValues: storedSearchParams,
    });

    const watchDate = watch('date');
    const watchCountry = watch('country');
    const watchLeague = watch('league');
    const selectedDate = watchDate?.from;

    const { data: airportSuggestions = [], isLoading: isAirportLoading } = useQuery({
        queryKey: ['originAirports', originKeyword],
        queryFn: async () => {
            if (originKeyword.length < MIN_KEYWORD_LEN || originKeyword.length > MAX_KEYWORD_LEN) return [];
            return GeoService.getCities(originKeyword);
        },
        enabled: originKeyword.length >= MIN_KEYWORD_LEN && originKeyword.length <= MAX_KEYWORD_LEN,
    });

    const { data: countries = [] } = useQuery({
        queryKey: ['countries', countryNameSearch],
        queryFn: () => SoccerService.getCountries(countryNameSearch),
        enabled: !!countryNameSearch,
    });

    const topFootballCountries: string[] = ['Spain', 'England', 'Germany', 'Italy', 'France'];
    const defaultCountryOptions = topFootballCountries.map((country) => ({
        value: country,
    }));

    const { data: leagues = [] } = useQuery({
        queryKey: ['leagues', watchCountry, leagueNameSearch],
        queryFn: () => SoccerService.getLeagues(watchCountry, leagueNameSearch),
        enabled: !!watchCountry,
    });

    const { data: teams = [] } = useQuery({
        queryKey: ['teams', watchLeague?.id, selectedDate, teamNameSearch],
        queryFn: () =>
          SoccerService.getTeams(
            watchLeague?.id!,
            calculateCurrentSeason(new Date(selectedDate)),
            teamNameSearch
          ),
        enabled: !!watchLeague?.id && !!selectedDate,
      });

    const onSubmit = (values: PackagesGenerationParams) => {
        const { country, ...formValues } = values;
        setStoredSearchParams(values);
        navigate(ROUTES.PACKAGES);
        fetchPackages(formValues);
    };

    const onClear = () => {
        reset(defaultGenerateParamsRef.current);
        setStoredSearchParams(defaultGenerateParamsRef.current);
    };

    React.useEffect(() => {
        const subscription = watch((value) => {
            setStoredSearchParams(value as PackagesGenerationParams);
        });
        return () => subscription.unsubscribe();
    }, [watch]);

    return (
        <div className={classes.main}>
            <div className={classes.overlay} />
            <div className={classes.title}>
                <h1 className={classes.mainTitle}>Find your next soccer experience</h1>
                <p className={classes.secondaryTitle}>View upcoming events, explore personalized packages, and more</p>
            </div>

            <Form layout="vertical" className={classes.content} onFinish={handleSubmit(onSubmit)}>
                <div className={classes.formInputs}>
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
                                                ? {
                                                      from: dates[0].format('YYYY-MM-DD'),
                                                      to: dates[1].format('YYYY-MM-DD'),
                                                  }
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

                    <Form.Item className={classes.selectCountryContainer}>
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
                                    options={
                                        countryNameSearch
                                            ? countries.map((country) => ({ value: country.name }))
                                            : defaultCountryOptions
                                    }
                                    notFoundContent={isAirportLoading ? 'Loading...' : 'No matches'}
                                    suffixIcon={<EnvironmentOutlined />}
                                />
                            )}
                        />
                    </Form.Item>

                    <Form.Item className={classes.selectLeague}>
                        <Controller
                            name="league"
                            control={control}
                            render={({ field }) => (
                                <AutoComplete
                                {...field}
                                value={typeof field.value === 'object' ? field.value?.name : field.value ?? ''}
                                allowClear
                                disabled={!watchCountry}
                                className={classes.selectLeague}
                                placeholder="Select League"
                                onSearch={(value) => setLeagueNameSearch(value)}
                                onChange={(text) => {
                                  field.onChange(text);
                                  setLeagueNameSearch(text);
                                }}
                                onSelect={(value: string) => {
                                  setLeagueNameSearch(undefined);
                                  const selected = leagues.find((l) => l.league.name === value);
                                  field.onChange(
                                    selected
                                      ? { id: selected.league.id, name: selected.league.name }
                                      : { id: '', name: value }
                                  );
                                  resetField('team');
                                }}
                                options={leagues.map((league) => ({ value: league.league.name }))}
                                notFoundContent={isAirportLoading ? 'Loading...' : 'No matches'}
                                suffixIcon={<TrophyOutlined />}
                              />
                            )}
                        />
                    </Form.Item>

                    <Form.Item className={classes.selectTeam}>
                        <Controller
                            name="team"
                            control={control}
                            render={({ field }) => (
                            <AutoComplete
                                {...field}
                                value={typeof field.value === 'object' ? field.value?.name : field.value ?? ''}
                                allowClear
                                disabled={!watchLeague || !selectedDate}
                                className={classes.selectTeam}
                                placeholder="Select Team"
                                onSearch={(value) => setTeamNameSearch(value)}
                                onChange={(text) => {
                                field.onChange(text);
                                setTeamNameSearch(text);
                                }}
                                onSelect={(value: string) => {
                                setTeamNameSearch(undefined);
                                const selected = teams.find((t) => t.team.name === value);
                                field.onChange(
                                    selected
                                    ? { id: selected.team.id, name: selected.team.name }
                                    : { id: '', name: value }
                                );
                                }}
                                options={teams.map((t) => ({ value: t.team.name }))}
                                notFoundContent={isAirportLoading ? 'Loading...' : 'No matches'}
                                suffixIcon={<TeamOutlined />}
                            />
                            )}
                        />
                        </Form.Item>
                </div>

                <div className={classes.buttonGroup}>
                    <Button
                        type="primary"
                        icon={<SearchOutlined />}
                        shape="round"
                        size="large"
                        htmlType="submit"
                        disabled={!isValid}
                    >
                        Search
                    </Button>
                    {isDirty && (
                        <Button danger icon={<CloseCircleOutlined />} shape="round" size="large" onClick={onClear}>
                            Clear
                        </Button>
                    )}
                </div>
            </Form>
        </div>
    );
};

export default SearchBar;
