# debit-credit
A really simple single user money accounting system intended to be used through it's REST API.

### Install
This app need's recent version of Node.js as it uses ES6 syntax a lot. It is known to work in Node v9.2.0 and fail in 6.6.0.

Clone the repo and install it's dependencies:
```
git clone https://github.com/machulen/debit-credit.git
npm i
```
That's it. The only dependencies used are express and pug.

### Usage
Start the app with
```
node index.js
```
and go to http://localhost:3000 in your browser. It should display some sample transactions as a colored list. Click to any transaction entry to view it's details.
To add a new transaction, make a POST request to http://localhost:3000 with transaction data in x-www-form-urlencoded format like this:
```
curl http://localhost:3000 -X POST -d "id=3&type=credit&effectiveDate=2018-04-18T14:10:00.000Z&amount=25"
```
The `id`, `type`, `effectiveDate` and `amount` fields are required (without any of them, a transaction faild validation).
* `id` can be any string but it should be unique. It's up to user how to ensure unique ids.
* `type` can be `debit` or `credit`, no other values are allowed.
* `effectiveDate` can be any number or string parsable to Date.
* `amount` must be a non-negative number or anything that casts to a non-negative number.

### Features
1. The App receives credit and debit financial transactions in POST requests to `/`.
2. The App serves a single user, so it only has just one financial account.
3. The App stores transactions history. For this purpose, in-memory storage is used.
4. Every incoming transaction is validated. A transaction is considered valid if all required fields are present and have valid values. All other fields are just ignored. Invalid transactions are refused with 403 status code.
  - Transactions with non-unique `id`s are refused too so you won't spend your money twice.
5. The desicion about where exactly a new transaction is to be inserted into the history is made based on it's effectiveDate. Thus, the history is always sorted by effectiveDate. It doesn't matter at which time the transaction has actually came.
6. After adding a transaction, a balance is calculated and stored in the history alongside the transaction data. If there are transactions that have more recent effectiveDate values, their balances are updated accordingly.
7. Any transaction, which leads to negative balance within the system, is refused with 403 status code. It includes the case when after applying this transaction any other transaction with more recent effectiveDate would result in negative balance.
8. The App is intended to be used programmatically via it's RESTful API. It's not possible to add transactions through it's web interface.
9. Once a transaction is added, it can't be removed from the system unless you restart the server.
10. The application has really simple UI that is accessible by GET request to `/`.
11. The UI should displays the transactions history list only.
12. Transactions list is done in accordion manner. By default the list shows short summary for each transaction. The detailed info of for a transaction is shown on click.
13. No jQuery or Bootstrap is used. Everything is implemented in plain CSS & JS (and Pug for markup & templating).
14. Credit and debit transactions are colored in shades of green and red respectively.
