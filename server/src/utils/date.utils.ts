import moment from 'moment';

export const DATE_AND_TIME_JSON_FORMAT = 'DD-MM-YYYY_HH-mm-ss';
export const DATE_AND_TIME_FORMAT = 'DD-MM-YYYY HH:mm:ss';

export const formatDate = (date: moment.MomentInput, format: string) => {
    return moment(date).format(format);
};
