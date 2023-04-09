Thai Lottery Checker
====================
![img.png](img.png)

This is a Node.js script that checks if a given Thai lottery number has won any prizes on a specific date. It scrapes the lottery results from the official Sanook News website using the Cheerio web scraping library.

Installation
------------

1. Clone this repository
2. Navigate to the project directory in your terminal
3. Run `npm install` to install the required dependencies

Usage
-----

1. Run `npm start` in your terminal
2. Enter the date you want to check in the format `dd/mm/yyyy`
3. Enter your lottery number(s) separated by commas (e.g. `123456, 654321`)
4. Choose whether you want to export the results to a CSV and/or TXT file(s)

Output
------

The script will output the results of your lottery number(s) for the given date in the terminal. If your number has won a prize, it will be highlighted in green, and the prize amount will be displayed.

The script will also create a directory called `lottery-results` in the project directory (if it doesn't already exist) and save the results to a CSV and/or TXT file(s), depending on your choice during the setup process.

CSV Output
----------

The CSV file will be named `results-<target_id>.csv` and will contain the following columns:


TXT Output
----------

The TXT file will be named `results-<target_id>.txt` and will contain the following information for each winning number:


License
-------

This script is licensed under the MIT License.
