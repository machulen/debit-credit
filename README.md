# debit-credit
A really simple single user money accounting system intended to be used through its REST API.

### Install
This app need's recent version of Node.js as it uses ES6 syntax a lot. It is known to work in Node v9.2.0 and fail in 6.6.0.

Clone the repo and install its dependencies:
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
and go to http://localhost:3000 in your browser. You should see an empty page with just a heading. Now run
```
./populate.sh
```
to add some sample transactions and reload the page. (I assume that you have `curl` on your machine.) Now you see a colored list of transactions, where credit ones are green and debit ones are red. Click to any transaction entry to view its details.

Try to add a new transaction by make a POST request to http://localhost:3000/api with transaction data in x-www-form-urlencoded format like this:
```
curl http://localhost:3000/api -X POST -d "id=5&type=debit&effectiveDate=2018-04-18T14:25:00.000Z&amount=125"
```
Oops... The transaction has been rejected! You can't spend more money than you have. You may also add `-i` argument to `curl` to see that the server responded with `403` status code.

Let's make another try:
```
curl http://localhost:3000/api -X POST -d "id=5&type=debit&effectiveDate=2018-04-18T14:02:30.000Z&amount=25"
```
Our transaction is rejected again! This time we had enough money to spend but applying this transaction would result in negative balance after transaction with `id=3`, namely, `-20`.

OK, let's add something that doesn't cause refusal.
```
curl http://localhost:3000/api -X POST -d "id=5&type=debit&effectiveDate=2018-04-18T14:12:30.000Z&amount=5"
```
Reload the page and see the new transaction appear. Notice that it changed balance after subsequent transactions but all values are still greater or equal to 0.

### Transaction fields
The `id`, `type`, `effectiveDate` and `amount` fields are required (without any of them, a transaction fails validation).
* `id` can be any string but it should be unique. It's up to user how to ensure unique ids.
* `type` can be `debit` or `credit`, no other values are allowed.
* `effectiveDate` can be any number or string parsable to Date.
* `amount` must be a non-negative number or anything that casts to a non-negative number.

### Features
1. The App receives credit and debit financial transactions in POST requests to `/api`.
2. The App serves a single user, so it only has just one financial account.
3. The App stores transactions history. For this purpose, in-memory storage is used.
4. Every incoming transaction is validated. A transaction is considered valid if all required fields are present and have valid values. All other fields are just ignored. Invalid transactions are refused with 403 status code.
5. Transactions with non-unique `id`s are refused too so you won't spend your money twice.
6. The desicion about where exactly a new transaction is to be inserted into the history is made based on it's effectiveDate. Thus, the history is always sorted by effectiveDate. It doesn't matter at which time the transaction has actually came.
7. After adding a transaction, a balance is calculated and stored in the history alongside the transaction data. If there are transactions that have more recent effectiveDate values, their balances are updated accordingly.
8. Any transaction, which leads to negative balance within the system, is refused with 403 status code. It includes the case when after applying this transaction any other transaction with more recent effectiveDate would result in negative balance.
9. The App is intended to be used programmatically via its RESTful API. It's not possible to add transactions through its web interface.
10. Once a transaction is added, it can't be removed from the system unless you restart the server.
11. The application has really simple UI that is accessible by GET request to `/api`.
12. The UI should displays the transactions history list only.
13. Transactions list is done in accordion manner. By default the list shows short summary for each transaction. The detailed info of for a transaction is shown on click.
14. No jQuery or Bootstrap is used. Everything is implemented in plain CSS & JS (and Pug for markup & templating).
15. Credit and debit transactions are colored in shades of green and red respectively.
