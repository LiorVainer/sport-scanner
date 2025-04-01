import chalk from 'chalk';

export class Logger {
    static info(message: string) {
        console.log(chalk.blue(`[INFO] ${message}`));
    }

    static success(message: string) {
        console.log(chalk.green(`[SUCCESS] ${message}`));
    }

    static warn(message: string) {
        console.log(chalk.yellow(`[WARN] ${message}`));
    }

    static error(message: string) {
        console.log(chalk.red(`[ERROR] ${message}`));
    }
    
}
