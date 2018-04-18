var express = require("express");
var app = express();
var insp = require('util').inspect;

var bodyParser = require("body-parser");
var parseUrlEncoded = bodyParser.urlencoded({ extended: false });
var tnxHistory = [
  {
    id: "0",
    type: "credit",
    amount: 100,
    effectiveDate: new Date("2018-04-18T14:04:50.000Z"),
    balance: 100
  },
  {
    id: "1",
    type: "debit",
    amount: 50,
    effectiveDate: new Date("2018-04-18T14:05:00.000Z"),
    balance: 50
  },
  {
    id: "2",
    type: "credit",
    amount: 100,
    effectiveDate: new Date("2018-04-18T14:05:30.000Z"),
    balance: 150
  }
];

app.post("/", parseUrlEncoded, (req, res) => {
  // console.log(req.body);
  // TODO validation
  let newTnx = req.body;
  newTnx.effectiveDate = new Date(+newTnx.effectiveDate);
  let i = tnxHistory.length;
  while (tnxHistory[i - 1].effectiveDate > newTnx.effectiveDate) {
    i--;
    if (i == 0)
      break;
  }
  // console.log(i);
  let prev = tnxHistory[i - 1];
  newTnx.balance = prev ? prev.balance : 0; // will be changed later
  // checking that the new transaction doesn't lead to negative balance
  if (newTnx.type === "debit") {
    let b = prev ? prev.balance : 0;
    b -= newTnx.amount;
    if (b < 0) {
      return res.status(403).json({
        "Error": "The transaction has been refused because it would result in negative balance.",
        "badTransaction": {...newTnx, balance: b}
      });
    }
    for (var j = i; j < tnxHistory.length; j++) {
      if ((b = tnxHistory[j].balance - newTnx.amount) < 0) {
        return res.status(403).json({
          "Error": "The transaction has been refused because it would result in negative balance after one of subsequent transactions.",
          "badTransaction": {...tnxHistory[j], balance: b}
        });
      }
    }
  }
  tnxHistory.splice(i, 0, newTnx);
  for (j = i; j < tnxHistory.length; j++) {
    tnxHistory[j].balance += newTnx.type === "credit" ? newTnx.amount : -newTnx.amount;
  }
  res.status(201).json(newTnx);
});

app.get("/", (req, res) => {
  res.end(
`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Ridiculously Simple Accounting System</title>
</head>
<body>
  <ul>
  ${tnxHistory.map((t) => "<li style='color:" + (t.type === "credit" ? "green" : "red") + ";'>" + insp(t) + "</li>").join("\n")}
  </ul>
</body>
</html>`);
})

app.listen(3000, () => console.log("Listening on port 3000"));
