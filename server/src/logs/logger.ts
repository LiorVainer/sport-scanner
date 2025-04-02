import chalk from 'chalk';

const getTimestamp = () => new Date().toISOString();

export class Logger {
    static info(message: string) {
        console.log(`${chalk.gray(`[${getTimestamp()}]`)} ${chalk.blue('[INFO]')} ${message}`);
    }

    static success(message: string) {
        console.log(`${chalk.gray(`[${getTimestamp()}]`)} ${chalk.green('[SUCCESS]')} ${message}`);
    }

    static warn(message: string) {
        console.log(`${chalk.gray(`[${getTimestamp()}]`)} ${chalk.yellow('[WARN]')} ${message}`);
    }

    static error(message: string) {
        console.log(`${chalk.gray(`[${getTimestamp()}]`)} ${chalk.red('[ERROR]')} ${message}`);
    }
}