import {load} from 'cheerio';
import axios from 'axios';
import inquirer from 'inquirer';
import chalk from 'chalk';
import datePicker from 'inquirer-datepicker-prompt';
import fs from 'fs';

inquirer.registerPrompt('date', datePicker);
const scrapeText = ($, selector) => $(selector).map((_, el) => $(el).text()).toArray();
const saveResultsToCSV = (results, filePath) => {
    const csvHeaders = 'Date,URL,Category,Number,Reward\n';
    const csvData = results
        .map((result) => [
            result.date,
            result.endpoint,
            result.category,
            result.number,
            result.reward,
        ])
        .map((row) => row.join(','))
        .join('\n');

    fs.writeFileSync(filePath, csvHeaders + csvData);
};

const saveResultsToTXT = (results, filePath) => {
    const txtData = results
        .map((result) => [
            `Date: ${result.date}`,
            `URL: ${result.endpoint}`,
            `Category: ${result.category}`,
            `Number: ${result.number}`,
            `Reward: ${result.reward}`,
            '',
        ])
        .map((row) => row.join('\n'))
        .join('\n');

    fs.writeFileSync(filePath, txtData);
};
const prizeData = [
    {
        id: 'prizeFirst',
        name: 'First Prize',
        reward: '6000000',
        selector: '#contentPrint > div.lottocheck__resize > div.lottocheck__sec.lottocheck__sec--bdnone > div.lottocheck__table > div:nth-child(1) > strong.lotto__number'
    },
    {
        id: 'prizeFirstNear',
        name: 'First Prize Near',
        reward: '100000',
        selector: '#contentPrint > div.lottocheck__resize > div.lottocheck__sec.lottocheck__sec--bdnone > div.lottocheck__sec--nearby > strong.lotto__number'
    },
    {
        id: 'prizeSecond',
        name: 'Second Prize',
        reward: '200000',
        selector: '#contentPrint > div.lottocheck__resize > div:nth-child(2) > div > span.lotto__number'
    },
    {
        id: 'prizeThird',
        name: 'Third Prize',
        reward: '80000',
        selector: '#contentPrint > div.lottocheck__resize > div:nth-child(3) > div > span'
    },
    {
        id: 'prizeForth',
        name: 'Forth Prize',
        reward: '40000',
        selector: '#contentPrint > div.lottocheck__resize > div.lottocheck__sec.lottocheck__sec--font-mini.lottocheck__sec--bdnoneads > div.lottocheck__box-item > span.lotto__number'
    },
    {
        id: 'prizeFifth',
        name: 'Fifth Prize',
        reward: '20000',
        selector: '#contentPrint > div.lottocheck__resize > div:nth-child(7) > div > span.lotto__number'
    },
];

const runningNumberData = [
    {
        id: 'runningNumberFrontThree',
        name: 'Front Three',
        reward: '4000',
        selector: '#contentPrint > div.lottocheck__resize > div.lottocheck__sec.lottocheck__sec--bdnone > div.lottocheck__table > div:nth-child(2) > strong.lotto__number'
    },
    {
        id: 'runningNumberBackThree',
        name: 'Back Three',
        reward: '4000',
        selector: '#contentPrint > div.lottocheck__resize > div.lottocheck__sec.lottocheck__sec--bdnone > div.lottocheck__table > div:nth-child(3) > strong.lotto__number'
    },
    {
        id: 'runningNumberBackTwo',
        name: 'Back Two',
        reward: '2000',
        selector: '#contentPrint > div.lottocheck__resize > div.lottocheck__sec.lottocheck__sec--bdnone > div.lottocheck__table > div:nth-child(4) > strong.lotto__number'
    },
];
const getLotto = async (targetId) => {
    const url = `https://news.sanook.com/lotto/check/${targetId}`;
    const res = await axios.get(url);
    const $ = load(res.data);

    const dateSelector = '#contentPrint > header > h2';
    const date = $(dateSelector).text().substring($(dateSelector).text().indexOf(' ') + 1);
    const getPrizeNumbers = (prize) => {
        const numbers = scrapeText($, prize.selector);
        return {...prize, amount: numbers.length, number: numbers};
    };
    const prizes = prizeData.map(getPrizeNumbers);
    const runningNumbers = runningNumberData.map(getPrizeNumbers);
    return {
        date: date,
        endpoint: url,
        prizes: prizes,
        runningNumbers: runningNumbers,
    };
};

const thaiMonthMapping = {
    'มกราคม': 'January',
    'กุมภาพันธ์': 'February',
    'มีนาคม': 'March',
    'เมษายน': 'April',
    'พฤษภาคม': 'May',
    'มิถุนายน': 'June',
    'กรกฎาคม': 'July',
    'สิงหาคม': 'August',
    'กันยายน': 'September',
    'ตุลาคม': 'October',
    'พฤศจิกายน': 'November',
    'ธันวาคม': 'December',
};

const toEnglishDate = (thaiDate) => {
    const components = thaiDate.split(' ');
    const day = parseInt(components[0], 10);
    const month = thaiMonthMapping[components[1]];
    const year = parseInt(components[2], 10) - 543; // Convert to Gregorian year

    return new Date(`${month} ${day}, ${year}`).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}
const displayResults = (result, userNumber) => {
    const border = chalk.gray('='.repeat(50));
    console.log(border);
    console.log(chalk.bold(`Date: ${toEnglishDate(result.date)}`));
    console.log(chalk.bold(`URL: ${result.endpoint}\n`));
    let isWinner = false;

    console.log(chalk.bold('Prizes:'));
    result.prizes.forEach((prize) => {
        console.log(border);
        console.log(chalk.green(`${prize.name}(${prize.id}):`));
        console.log(`Reward: ${prize.reward}`);
        console.log(`Amount: ${prize.amount}`);
        console.log(`Numbers: ${prize.number.join(', ')}\n`);

        if (prize.number.includes(userNumber)) {
            console.log(
                chalk.bgGreen(`Congratulations! You won ${prize.name} with a reward of ${prize.reward} THB`),
            );
            isWinner = true;
        }
    });

    console.log(border);
    console.log(chalk.bold('Running Numbers:'));
    result.runningNumbers.forEach((runningNumber) => {
        console.log(border);
        console.log(chalk.yellow(`${runningNumber.name}(${runningNumber.id}):`));
        console.log(`Reward: ${runningNumber.reward}`);
        console.log(`Amount: ${runningNumber.amount}`);
        console.log(`Numbers: ${runningNumber.number.join(', ')}\n`);

        if (runningNumber.number.includes(userNumber)) {
            console.log(
                chalk.bgGreen(`Congratulations! You won ${runningNumber.name} with a reward of ${runningNumber.reward} THB`),
            );
            isWinner = true;
        }
    });

    console.log(border);
    if (!isWinner) {
        console.log(chalk.bgRed('Sorry, your number did not win any prizes.'));
    }
    console.log(border);

    return isWinner;
};

(async () => {
    const questions = [
        {
            type: 'date',
            name: 'dateInput',
            message: 'Enter the date:',
            format: ['dd', 'mm', 'c', 'yy'],
            suffix: '\nFormat: dd/mm/yyyy\nExample: 01/05/2023',
        },
        {
            type: 'input',
            name: 'userNumber',
            message: 'Enter your lottery number:',
            validate: (input) => {
                if (input.trim().length > 0) {
                    return true;
                }
                return 'Please enter a valid lottery number.';
            },
        },
        {
            type: 'confirm',
            name: 'exportCSV',
            message: 'Do you want to export the results to a CSV file?',
            default: true,
        },
        {
            type: 'confirm',
            name: 'exportTXT',
            message: 'Do you want to export the results to a TXT file?',
            default: true,
        },
    ];

    const {dateInput, userNumber, exportCSV, exportTXT} = await inquirer.prompt(questions);
    const thaiYear = dateInput.getFullYear() + 543;
    const targetId = dateInput
        .toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
        })
        .replace(/\//g, '') + thaiYear;
    const result = await getLotto(targetId);

    const userNumbers = userNumber.split(',').map((number) => number.trim());
    const winningResults = [];

    userNumbers.forEach((number) => {
        const isWinner = displayResults(result, number);
        if (isWinner) {
            winningResults.push({number, result});
        }

    });
    const outputPath = 'lottery-results';
    if (exportCSV || exportTXT) {

        if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath);
        }
    }
    if (exportCSV) {
        const csvPath = `${outputPath}/results-${targetId}.csv`;
        const headers = ['Date', 'URL', 'Category', 'Number', 'Reward'];
        const csvData = winningResults.map(({number, result}) =>
            result.prizes
                .filter((prize) => prize.number.includes(number))
                .map((prize) => [toEnglishDate(result.date), result.endpoint, prize.name, number, prize.reward].join(','))
                .join('\n'),
        );
        const csvContent = [headers.join(','), ...csvData].join('\n');
        fs.writeFileSync(csvPath, csvContent, 'utf8');
        console.log(`CSV file saved to ${csvPath}`);
    }
    if (exportTXT) {
        const txtPath = `${outputPath}/results-${targetId}.txt`;
        const txtContent = winningResults
            .map(({number, result}) => {
                const prizeResults = result.prizes
                    .filter((prize) => prize.number.includes(number))
                    .map(
                        (prize) =>
                            `Date: ${toEnglishDate(result.date)}\nURL: ${result.endpoint}\nCategory: ${prize.name}\nNumber: ${number}\nReward: ${prize.reward}\n`,
                    )
                    .join('\n');
                return prizeResults;
            })
            .join('\n');
        fs.writeFileSync(txtPath, txtContent, 'utf8');
        console.log(`TXT file saved to ${txtPath}`);
    }
})();

