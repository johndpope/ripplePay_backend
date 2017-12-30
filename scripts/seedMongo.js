const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');
const async = require('async');

const { addresses, bank } = require('../configs/addresses');
const { CashRegister, Money } = require('../models/moneyStorage');
const { ShapeShiftTransaction } = require('../models/shapeShiftTransaction');

mongoose.Promise = global.Promise;

if (process.env.NODE_ENV == 'production') {
  mongoose.connect(process.env.MONGO_URL);
} else {
  mongoose.connect('mongodb://localhost:ripplePay/ripplePay');
}

mongoose.connection.once('connected', () => {
    mongoose.connection.db.dropCollection('vaults');
    mongoose.connection.db.dropCollection('cashregisters');
    mongoose.connection.db.dropCollection('money');
    mongoose.connection.db.collection("cashregisters").createIndex({address: 1}, {background: true});
    mongoose.connection.db.collection("cashregisters").createIndex({balance: 1}, {background: true});
    mongoose.connection.db.collection("shapeshifttransactions").createIndex({ userId: 1, shapeShiftAddress: 1, date: 1}, {background: true});
    mongoose.connection.db.collection("users").createIndex({screenName: 1}, {background: true});
    mongoose.connection.db.collection("users").createIndex({email: 1}, {background: true});
    mongoose.connection.db.collection("usedwallets").createIndex({wallet: 1}, {background: true});
});
const RippledServer = require('../services/rippleAPI');
const rippledServer = new RippledServer();
let addrs = Object.keys(addresses);

rippledServer.api.connect().then(()=>{
  let generate = function(n = 0){

    if ( n === 5 )
    {
      return;
    }
    rippledServer.api.getBalances(addrs[n]).then((info) => {
      let Register = CashRegister;
      let registerSpecs = {
        address: addrs[n],
        balance: info[0].value
      };
      let newCashRegister = new Register(registerSpecs);
      newCashRegister.save(function (err) {
        if (err) { console.log('did not work'); }
        return generate(n + 1);
      });
    });
  };
  generate();
});

let money = new Money;
money.save(function(err){

});
let shapeShiftTransaction = new ShapeShiftTransaction;
shapeShiftTransaction.save(function(err){

});