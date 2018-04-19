#!/bin/sh
curl http://localhost:3000/api -X POST -d "id=0&type=credit&effectiveDate=2018-04-18T14:00:00.000Z&amount=100"
curl http://localhost:3000/api -X POST -d "id=1&type=debit&effectiveDate=2018-04-18T14:05:00.000Z&amount=50"
curl http://localhost:3000/api -X POST -d "id=2&type=credit&effectiveDate=2018-04-18T14:10:00.000Z&amount=25"
curl http://localhost:3000/api -X POST -d "id=3&type=debit&effectiveDate=2018-04-18T14:15:00.000Z&amount=70"
curl http://localhost:3000/api -X POST -d "id=4&type=credit&effectiveDate=2018-04-18T14:20:00.000Z&amount=75"
