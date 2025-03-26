import { useEffect, useState } from 'react';
import { AutoComplete, Button, Col, DatePicker, Form, Input, message, Modal, Row, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { Controller, useForm } from 'react-hook-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import styles from './share-match-experience-modal.module.scss';
import { MatchExperienceService } from '@/api/services/match-experience.service';
import { SoccerService } from '@/api/services/soccer.service';
import { FileService } from '@/api/services/file.service';
import { useQueryOnDefinedParam } from '@api/hooks/service.query.ts';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { MatchExperience } from '@/models/match-experience.model.ts';
import { calculateCurrentSeason } from '@/utils/date.utils.ts';
import { QUERY_KEYS } from '@api/constants/query-keys.const.ts';
import { getPictureSrcUrl } from '@/utils/picture.utils.ts';

const MatchExperienceFormValuesSchema = z.object({
    title: z.string().min(3, 'Title is too short').nonempty('Title is required'),
    description: z.string().min(10, 'Description is too short').nonempty('Description is required'),
    picture: z.string().optional(),
    country: z.string().nonempty('Country is required'),
    stadium: z.string().nonempty('Stadium is required'),
    league: z.string().nonempty('League is required'),
    leagueId: z.number().optional(),
    homeTeam: z.string().nonempty('Home Team is required'),
    awayTeam: z.string().nonempty('Away Team is required'),
    matchDate: z.preprocess(
        (val) => (typeof val === 'string' || val instanceof Date ? dayjs(val) : val),
        z.custom<Dayjs>((val) => dayjs.isDayjs(val), { message: 'Invalid date format' })
    ),
});

type MatchExperienceFormValues = z.infer<typeof MatchExperienceFormValuesSchema>;

const DEFAULT_INITIAL_VALUES: MatchExperienceFormValues = {
    title: '',
    description: '',
    picture: '',
    country: '',
    stadium: '',
    league: '',
    homeTeam: '',
    awayTeam: '',
    matchDate: dayjs(),
};

type ShareMatchExperienceModalProps = {
    onClose: () => void;
    existingMatchExperience?: MatchExperience;
};

export const ShareMatchExperienceModal = ({ onClose, existingMatchExperience }: ShareMatchExperienceModalProps) => {
    const [imageUrl, setImageUrl] = useState<string>('');
    const [selectedLeagueId, setSelectedLeagueId] = useState<number>();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const queryClient = useQueryClient();

    const {
        getValues,
        control,
        handleSubmit,
        setValue,
        reset,
        trigger,
        watch,
        formState: { errors },
    } = useForm<MatchExperienceFormValues>({
        resolver: zodResolver(MatchExperienceFormValuesSchema),
        defaultValues: existingMatchExperience
            ? { ...existingMatchExperience, matchDate: dayjs(existingMatchExperience.matchDate) }
            : { ...DEFAULT_INITIAL_VALUES },
    });

    const { picture, description, ...rest } = watch();
    const isAiButtonDisabled =
        Object.keys(rest).length === 0 || Object.values(rest).some((value) => value === undefined || value === '');

    const { data: countries = [] } = useQuery({
        queryKey: ['countries'],
        queryFn: SoccerService.getCountries,
    });

    const { data: leagues = [] } = useQueryOnDefinedParam(
        'leagues',
        getValues('country') ? getValues('country') : undefined,
        SoccerService.getLeagues
    );

    const { data: stadiums = [] } = useQueryOnDefinedParam(
        'stadiums',
        getValues('country') ? getValues('country') : undefined,
        SoccerService.getVenues
    );

    const { data: teams = [] } = useQueryOnDefinedParam(
        'teams',
        selectedLeagueId && getValues('matchDate')
            ? { leagueId: selectedLeagueId, season: calculateCurrentSeason(getValues('matchDate').toDate()) }
            : undefined,
        ({ leagueId, season }) => SoccerService.getTeams({ leagueId, season })
    );

    useEffect(() => {
        if (existingMatchExperience && leagues && !selectedLeagueId) {
            const leagueId = leagues.find((league) => league.league.name === existingMatchExperience?.league)?.league
                .id;

            setSelectedLeagueId(leagueId);
        }
    }, [leagues]);

    const resetTeams = () => {
        queryClient.setQueryData(['teams'], []);
    };

    const fetchAIHelp = async () => {
        try {
            const response = await MatchExperienceService.betterDescription({
                ...getValues(),
                matchDate: getValues().matchDate.toDate(),
            });

            if (response) {
                setValue('description', response);
                message.success('AI-generated description added!');
            } else {
                message.error('Failed to generate description :(');
            }
        } catch (error) {
            message.error('An error occurred while fetching AI help.');
        }
    };

    const resetValuesOnCountryChange = (value: string) => {
        setValue('country', value);
        setValue('league', '');
        setValue('stadium', '');
        setValue('homeTeam', '');
        setValue('awayTeam', '');
        setSelectedLeagueId(undefined);
        resetTeams();
        void trigger('country');
    };

    const resetValuesOnLeagueChange = (value: string, id: number | undefined) => {
        setSelectedLeagueId(id);
        setValue('league', value);
        setValue('homeTeam', '');
        setValue('awayTeam', '');
        resetTeams();
        void trigger('league');
    };

    const resetValuesOnChange = (key: keyof MatchExperienceFormValues, value: string) => {
        setValue(key, value);
        trigger(key);
    };

    const onSubmit = async (values: MatchExperienceFormValues) => {
        const isValid = await trigger();
        if (!isValid) return;

        try {
            let uploadedImageUrl = imageUrl;

            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);
                const { data } = await FileService.handleUpload(formData);
                uploadedImageUrl = data.url.split('public/')[1];
            }

            const { picture, ...valuesWithConvertedDate } = { ...values, matchDate: values.matchDate.toDate() };

            if (existingMatchExperience) {
                existingMatchExperience.picture &&
                    uploadedImageUrl &&
                    (await FileService.deleteFile(existingMatchExperience.picture));

                await MatchExperienceService.updateMatchExperience(existingMatchExperience._id, {
                    ...valuesWithConvertedDate,
                    ...(uploadedImageUrl && { picture: uploadedImageUrl }),
                });

                queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MATCH_EXPERIENCE, existingMatchExperience._id] });

                message.success('Match Experience updated successfully');
            } else {
                await MatchExperienceService.createMatchExperience({
                    ...valuesWithConvertedDate,
                    picture: uploadedImageUrl,
                });

                message.success('Match Experience Shared successfully');
            }
            reset();
            setImageUrl('');
            setSelectedLeagueId(undefined);
            resetTeams();
            onClose();
        } catch (error) {
            message.error('An error occurred while submitting the match experience.');
        }
    };

    return (
        <Modal
            title="Share your match experience"
            open
            onCancel={() => {
                reset();
                setImageUrl('');
                setSelectedLeagueId(undefined);
                resetTeams();
                onClose();
            }}
            footer={null}
            className={styles.modal}
        >
            <Form layout="vertical" className={styles.form} onFinish={handleSubmit(onSubmit)}>
                <Form.Item
                    label="Match Date"
                    validateStatus={errors.matchDate ? 'error' : ''}
                    help={errors.matchDate?.message}
                >
                    <Controller
                        name="matchDate"
                        control={control}
                        render={({ field }) => (
                            <DatePicker
                                {...field}
                                format={'DD/MM/YYYY'}
                                value={field.value ? dayjs(field.value) : null}
                                style={{ width: '100%' }}
                                onChange={(date) => setValue('matchDate', date ? dayjs(date) : dayjs())}
                            />
                        )}
                    />
                </Form.Item>

                <Form.Item
                    label="Country"
                    validateStatus={errors.country ? 'error' : ''}
                    help={errors.country?.message}
                >
                    <AutoComplete
                        value={getValues('country')}
                        options={countries.map((option) => ({ value: option.name }))}
                        onSelect={resetValuesOnCountryChange}
                        onClear={() => resetValuesOnCountryChange('')}
                        placeholder="Select a country"
                        allowClear
                    />
                </Form.Item>

                <Form.Item label="League" validateStatus={errors.league ? 'error' : ''} help={errors.league?.message}>
                    <AutoComplete
                        value={getValues('league')}
                        options={leagues.map((option) => ({ value: option.league.name, id: option.league.id }))}
                        onSelect={(value, option) => resetValuesOnLeagueChange(value, option.id)}
                        onClear={() => resetValuesOnLeagueChange('', undefined)}
                        placeholder="Select a league"
                        disabled={!getValues('country')}
                        allowClear
                    />
                </Form.Item>

                <Form.Item
                    label="Stadium"
                    validateStatus={errors.stadium ? 'error' : ''}
                    help={errors.stadium?.message}
                >
                    <AutoComplete
                        value={getValues('stadium')}
                        options={stadiums.map((option) => ({ value: option.name }))}
                        onSelect={(value) => resetValuesOnChange('stadium', value)}
                        onClear={() => resetValuesOnChange('stadium', '')}
                        placeholder="Select a stadium"
                        disabled={!getValues('country')}
                        allowClear
                    />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Home Team"
                            validateStatus={errors.homeTeam ? 'error' : ''}
                            help={errors.homeTeam?.message}
                        >
                            <AutoComplete
                                value={getValues('homeTeam')}
                                options={teams
                                    .filter((team) => team.team.name !== getValues('awayTeam'))
                                    .map((option) => ({ value: option.team.name }))}
                                onSelect={(value) => resetValuesOnChange('homeTeam', value)}
                                onClear={() => resetValuesOnChange('homeTeam', '')}
                                placeholder="Select home team"
                                disabled={!getValues('league') || !getValues('matchDate')}
                                allowClear
                            />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            label="Away Team"
                            validateStatus={errors.awayTeam ? 'error' : ''}
                            help={errors.awayTeam?.message}
                        >
                            <AutoComplete
                                value={getValues('awayTeam')}
                                options={teams
                                    .filter((team) => team.team.name !== getValues('homeTeam'))
                                    .map((option) => ({ value: option.team.name }))}
                                onSelect={(value) => resetValuesOnChange('awayTeam', value)}
                                onClear={() => resetValuesOnChange('awayTeam', '')}
                                placeholder="Select away team"
                                disabled={!getValues('league') || !getValues('matchDate')}
                                allowClear
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item label="Title" validateStatus={errors.title ? 'error' : ''} help={errors.title?.message}>
                    <Controller name="title" control={control} render={({ field }) => <Input {...field} />} />
                </Form.Item>

                <Form.Item
                    label="Description"
                    validateStatus={errors.description ? 'error' : ''}
                    help={errors.description?.message}
                    className={styles.formItem}
                >
                    <div className={styles.descriptionContainer}>
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => <Input.TextArea {...field} className={styles.textArea} />}
                        />
                        <Button className={styles.aiButton} onClick={fetchAIHelp} disabled={isAiButtonDisabled}>
                            Ask AI for help
                        </Button>
                    </div>
                </Form.Item>

                <Form.Item
                    label="Picture From The Match"
                    validateStatus={errors.picture ? 'error' : ''}
                    help={errors.picture?.message}
                >
                    <Upload
                        maxCount={1}
                        beforeUpload={(file) => {
                            setSelectedFile(file);

                            const reader = new FileReader();
                            reader.onload = (e) => {
                                setImageUrl(e.target?.result as string);
                            };
                            reader.readAsDataURL(file);

                            return false;
                        }}
                        onRemove={() => {
                            setImageUrl('');
                            setSelectedFile(null);
                        }}
                        showUploadList={true}
                    >
                        <Button className={styles.uploadButton} icon={<UploadOutlined />} block>
                            {existingMatchExperience ? 'Upload New Picture' : 'Upload Your Picture'}
                        </Button>
                    </Upload>
                </Form.Item>

                {(existingMatchExperience || imageUrl) && (
                    <div className={styles.imagePreviewContainer}>
                        <img
                            src={
                                imageUrl
                                    ? imageUrl
                                    : existingMatchExperience?.picture &&
                                      getPictureSrcUrl(existingMatchExperience.picture)
                            }
                            alt="Uploaded Preview"
                            className={styles.imagePreview}
                        />
                    </div>
                )}

                <Form.Item>
                    <Button type="primary" htmlType="submit" className={styles.submitButton}>
                        {existingMatchExperience ? 'Update' : 'Share'}
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};
