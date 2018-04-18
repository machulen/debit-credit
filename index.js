const express = require("express");
const app = express();
const insp = require('util').inspect;

const bodyParser = require("body-parser");
const parseUrlEncoded = bodyParser.urlencoded({ extended: false });

app.set('view engine', 'pug')

class Transaction {
  constructor(rawTnx = {}) {  // performs validation; if validation failed, the object returned contains an 'error' field
    if (!rawTnx.id)
      return {
        error: "Invalid transaction: id is missing",
        rawTransaction: rawTnx
      };
    else
      this.id = rawTnx.id.toString(); // for simplicity, the app doesn't check that id is unique
    if (rawTnx.type !== "debit" && rawTnx.type !== "credit")
      return {
        error: `Invalid  transaction: type is ${rawTnx.type}. The only allowed values are "debit" and "credit"`,
        rawTransaction: rawTnx
      };
    else
      this.type = rawTnx.type;
    if (!(+rawTnx.amount >= 0))
      return {
        error: `Invalid transaction: amount is ${rawTnx.amount}. It should be a non-negative number or anything that casts to a non-negative number.`,
        rawTransaction: rawTnx
      };
    else
      this.amount = +rawTnx.amount;
    if (!isNaN(+rawTnx.effectiveDate))
      this.effectiveDate = new Date(+rawTnx.effectiveDate);
    else if (!isNaN(Date.parse(rawTnx.effectiveDate)))
      this.effectiveDate = new Date(rawTnx.effectiveDate);
    else
      return {
        error: `Invalid transaction: effectiveDate is ${rawTnx.effectiveDate}. It should be a number or a string parsable to a date.`,
        rawTransaction: rawTnx
      };
  }
}

class TransactionHistory extends Array {
  applyTransaction(tnx) {
    const newTnx = new Transaction(tnx)
    if (newTnx.error)
      return newTnx;

    // find the right place to incert the new transaction so that the history stays sorted by effectiveDate
    let i = this.length;
    while (i > 0 && this[i - 1].effectiveDate > newTnx.effectiveDate) {
      i--;
      if (i == 0)
        break;
    }
    let prev = this[i - 1];
    newTnx.balance = prev ? prev.balance : 0; // will be changed later

    // check that the new transaction doesn't lead to negative balance
    if (newTnx.type === "debit") {
      let b = prev ? prev.balance : 0;
      b -= newTnx.amount;
      if (b < 0) {
        return {
          "Error": "The transaction has been refused because it would result in negative balance.",
          "badTransaction": {...newTnx, balance: b}
        };
      }
      for (let j = i; j < this.length; j++) {
        if ((b = this[j].balance - newTnx.amount) < 0) {
          return {
            "Error": "The transaction has been refused because it would result in negative balance after one of subsequent transactions.",
            "badTransaction": {...this[j], balance: b}
          };
        }
      }
    }

    // actually insert the transaction and update balances
    this.splice(i, 0, newTnx);
    for (let j = i; j < this.length; j++) {
      this[j].balance += newTnx.type === "credit" ? newTnx.amount : -newTnx.amount;
    }
    return newTnx;
  }
}

const tnxHistory = new TransactionHistory;
tnxHistory.applyTransaction({id: "0", type: "credit", amount: 100, effectiveDate: "2018-04-18T14:00:00.000Z"});
tnxHistory.applyTransaction({id: "1", type: "debit" , amount: 50 , effectiveDate: "2018-04-18T14:05:00.000Z"});
tnxHistory.applyTransaction({id: "2", type: "credit", amount: 100, effectiveDate: "2018-04-18T14:15:00.000Z"});

app.post("/", parseUrlEncoded, (req, res) => {
  let t = applyTransaction(req.body);
  if (t.error)
    res.status(403).json(t);
  else
    res.status(201).json(t);
});

app.get("/", (req, res) => {
  res.render('index', { tnxHistory: tnxHistory });
})

app.listen(3000, () => console.log("Listening on port 3000"));
