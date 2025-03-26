import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import weekYear from 'dayjs/plugin/weekYear';
import moment from 'moment/moment';

dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(weekOfYear);
dayjs.extend(weekYear);

export const calculateCurrentSeason = (date: Date): number => {
    return date.getMonth() >= 6 ? date.getFullYear() : date.getFullYear() - 1;
};

export const formatMessageDate = (date: Date | undefined) => {
    const messageDate = moment(date);
    const today = moment().startOf('day');
    const yesterday = moment().subtract(1, 'days').startOf('day');

    if (messageDate.isSame(today, 'day')) return 'Today';
    if (messageDate.isSame(yesterday, 'day')) return 'Yesterday';
    return messageDate.format('MMMM D, YYYY');
};

export const areDatesInSameHour = (date1: Date, date2: Date): boolean => {
    return dayjs(date1).isSame(date2, 'hour');
};
