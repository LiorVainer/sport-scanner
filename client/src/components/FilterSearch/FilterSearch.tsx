import { useEffect, useRef, useState } from 'react';
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
import { SoccerService } from '@/api/services/soccer.service';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import classes from './filter-search.module.scss';
import { ROUTES } from '@/constants/routes.const';
import { useNavigate } from 'react-router';
import { GeoService } from '@/api/services/geo.service';
import { usePackages } from '@/context/PackagesContext';
import { useLocalStorage } from '@/hooks/useLocalStorage.hooks';
import {
    PackagesGenerationFormValues,
    PackagesGenerationFormValuesSchema,
} from '@/models/packages/package-generate-params.model.ts';
import {
    DEFAULT_MAX_PRICE,
    DEFAULT_TEAMS,
    MAX_AIRPORT_SEARCH_KEYWORD_LEN,
    MAX_PRICE,
    MAX_TEAMS_LIMIT,
    MIN_COUNTRY_SEARCH_KEYWORD_LEN,
    MIN_PRICE,
    MIN_SEARCH_KEYWORD_LEN,
    TopFootballCountries,
} from './filter-search.const';

const { RangePicker } = DatePicker;
const { Option } = Select;

const calcDefaultGenerateParams: () => PackagesGenerationFormValues = () => {
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
        teams: undefined,
        country: undefined,
    };
};

const DefaultCountryOptions = TopFootballCountries.map((country) => ({
    value: country,
}));

const FilterSearch = () => {
    const defaultGenerateParamsRef = useRef(calcDefaultGenerateParams());
    const [countryNameSearch, setCountryNameSearch] = useState<string>();
    const [leagueNameSearch, setLeagueNameSearch] = useState<string>();
    const [teamNameSearch, setTeamNameSearch] = useState<string>();

    const navigate = useNavigate();
    const { fetchPackages } = usePackages();

    const [storedSearchParams, setStoredSearchParams] = useLocalStorage<PackagesGenerationFormValues>(
        'searchParams',
        defaultGenerateParamsRef.current
    );

    const [originKeyword, setOriginKeyword] = useState(storedSearchParams.originIATA);

    const {
        control,
        handleSubmit,
        watch,
        formState: { isValid, isDirty },
        reset,
        resetField,
        setValue,
    } = useForm<PackagesGenerationFormValues>({
        resolver: zodResolver(PackagesGenerationFormValuesSchema),
        defaultValues: storedSearchParams,
    });

    const watchCountry = watch('country');
    const watchLeague = watch('league');
    const watchTeams = watch('teams');

    const { data: airportSuggestions = [], isLoading: isAirportLoading } = useQuery({
        queryKey: ['originAirports', originKeyword],
        queryFn: async () => {
            return GeoService.getCities(originKeyword);
        },
        enabled:
            originKeyword.length >= MIN_SEARCH_KEYWORD_LEN && originKeyword.length <= MAX_AIRPORT_SEARCH_KEYWORD_LEN,
    });

    const { data: countries = [] } = useQuery({
        queryKey: ['countries', countryNameSearch],
        queryFn: () => SoccerService.getCountries(countryNameSearch),
        enabled: !!countryNameSearch && countryNameSearch.length >= MIN_COUNTRY_SEARCH_KEYWORD_LEN,
    });

    const { data: leagues = [] } = useQuery({
        queryKey: ['leagues', watchCountry, leagueNameSearch],
        queryFn: () => SoccerService.getLeagues(watchCountry, leagueNameSearch),
        enabled: !!watchCountry,
    });

    const { data: teams = [] } = useQuery({
        queryKey: ['teams', teamNameSearch],
        queryFn: async () => await SoccerService.getTeams(teamNameSearch!),
        enabled: !!teamNameSearch && teamNameSearch.length >= MIN_SEARCH_KEYWORD_LEN,
    });

    const onSubmit = (values: PackagesGenerationFormValues) => {
        const { country, ...formValues } = values;
        navigate(ROUTES.PACKAGES);
        const { teams, ...rest } = formValues;

        const minimizedTeams = teams?.map((team) => ({
            id: team.id,
            name: team.name,
        }));

        const params = {
            ...rest,
            teams: minimizedTeams,
        };

        fetchPackages(params);
    };

    const onClear = () => {
        reset(defaultGenerateParamsRef.current);
        setStoredSearchParams(defaultGenerateParamsRef.current);
    };

    useEffect(() => {
        const subscription = watch((value) => {
            setStoredSearchParams(value as PackagesGenerationFormValues);
        });
        return () => subscription.unsubscribe();
    }, [watch]);

    return (
        <Form layout="vertical" className={classes.content} onFinish={handleSubmit(onSubmit)}>
            <div className={classes.formInputs}>
                <Form.Item>
                    <Controller
                        name="originIATA"
                        control={control}
                        render={({ field }) => (
                            <AutoComplete
                                allowClear
                                className={classes.originAirport}
                                placeholder="Select Origin Airport"
                                onSelect={(value) => {
                                    const selectedCity = airportSuggestions.find(
                                        (city) => `${city.name} (${city.iataCode})` === value
                                    );
                                    field.onChange(selectedCity?.iataCode || '');
                                }}
                                value={originKeyword || field.value}
                                onChange={(value) => setOriginKeyword(value)}
                                onClear={() => field.onChange('')}
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
                                            value={[
                                                field.value?.min ?? MIN_PRICE,
                                                field.value?.max ?? DEFAULT_MAX_PRICE,
                                            ]}
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
                                allowClear
                                className={classes.selectCountry}
                                placeholder="Select Country"
                                disabled={!!watchTeams && !!watchTeams?.length}
                                onChange={(text) => setCountryNameSearch(text)}
                                onSelect={(value) => {
                                    setCountryNameSearch(undefined);
                                    setValue('league', undefined);
                                    setLeagueNameSearch(undefined);
                                    setValue('teams', undefined);
                                    setTeamNameSearch(undefined);
                                    field.onChange(value);
                                }}
                                onClear={() => {
                                    field.onChange(undefined);
                                    setCountryNameSearch(undefined);
                                    setValue('league', undefined);
                                    setLeagueNameSearch(undefined);
                                }}
                                options={
                                    countryNameSearch
                                        ? countries.map((country) => ({ value: country.name }))
                                        : DefaultCountryOptions
                                }
                                value={countryNameSearch || field.value || ''}
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
                                value={watchLeague ? watchLeague.name : leagueNameSearch}
                                allowClear
                                className={classes.selectLeague}
                                placeholder="Select League"
                                disabled={!watchCountry || (!!watchTeams && !!watchTeams?.length)}
                                onSearch={(value) => setLeagueNameSearch(value)}
                                onChange={(text) => {
                                    if (text === '') return;

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
                                    setValue('teams', undefined);
                                }}
                                onClear={() => {
                                    setValue('league', undefined);
                                    setLeagueNameSearch(undefined);
                                }}
                                options={leagues.map((league) => ({ value: league.league.name }))}
                                notFoundContent={isAirportLoading ? 'Loading...' : 'No matches'}
                                suffixIcon={<TrophyOutlined />}
                            />
                        )}
                    />
                </Form.Item>

                <Form.Item className={classes.selectTeams}>
                    <Controller
                        name="teams"
                        control={control}
                        render={({ field }) => (
                            <Select
                                mode="multiple"
                                showSearch
                                allowClear
                                maxTagCount="responsive"
                                className={classes.selectTeams}
                                placeholder="Select Teams"
                                disabled={!!watchLeague || !!watchCountry}
                                labelInValue
                                onSearch={(value) => setTeamNameSearch(value)}
                                onChange={(selectedOptions) => {
                                    if (selectedOptions.length > MAX_TEAMS_LIMIT) return;

                                    const selectedNames = selectedOptions.map((opt) => opt.value);

                                    const teamsArr = !teamNameSearch ? DEFAULT_TEAMS : teams;

                                    const newSelections = selectedNames
                                        .map((val) => teamsArr.find((t) => t.name === val))
                                        .filter(Boolean)
                                        .map((team) => ({ id: team!.id, name: team!.name, logo: team!.logo }));

                                    const prevSelections = field.value ?? [];
                                    const merged = [
                                        ...prevSelections.filter((team) => selectedNames.includes(team.name)),
                                        ...newSelections.filter((t) => !prevSelections.some((p) => p.id === t.id)),
                                    ];

                                    field.onChange(merged);
                                }}
                                onClear={() => {
                                    resetField('teams');
                                    setTeamNameSearch(undefined);
                                }}
                                value={
                                    field.value?.map((team) => ({
                                        value: team.name,
                                        label: (
                                            <div className={classes.teamItem}>
                                                <img src={team.logo} alt={team.name} />
                                                {field.value && field.value?.length <= 1 && team.name}
                                            </div>
                                        ),
                                    })) ?? []
                                }
                                options={(!teamNameSearch ? DEFAULT_TEAMS : teams).map((team) => ({
                                    value: team.name,
                                    label: (
                                        <div className={classes.teamItem}>
                                            <img src={team.logo} alt={team.name} />
                                            {team.name}
                                        </div>
                                    ),
                                }))}
                                notFoundContent={isAirportLoading ? 'Loading...' : 'No matches'}
                                suffixIcon={<TeamOutlined />}
                                filterOption={false}
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
    );
};

export default FilterSearch;
