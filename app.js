const express = require('express');
const https = require('https');
const fs = require('fs');
const mongoose = require('mongoose');

const app = express();
const PORT = 443;
const salt = 'salt';
const merchant_id = 0;

const Users = require('./models/users'); // Users model

// register view engine
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// MongDB connection
const dbURI = 'mongodb+srv://new-user:test12345@cluster0.wodilhl.mongodb.net/node-tuts?retryWrites=true&w=majority';
mongoose
    .connect(dbURI)
    .then((result) => console.log('connected to db'))
    .catch((err) => console.log(err));

app.post('/get_balance', (req, res) => {
    let user_id = req.body.data.user_id;

    // Get user data
    Users
        .findOne({user_id:user_id})
        .then((user_data) => {
            let get_balanse = require('./functions/get_balance');
            let balance = get_balanse.get_balance(salt, merchant_id, req.body, user_data);
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(balance));
        })
        .catch((error) => {
            console.log(error);
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({
                "result": false,
                "err_code": 4
            }));
        })
})

app.post('/get_account_details', (req, res) => {
    let user_id = req.body.data.user_id;

    // Get user data
    Users
        .findOne({user_id:user_id})
        .then((user_data) => {
            let get_account_details = require('./functions/get_account_details');
            let account_details = get_account_details.get_account_details(salt, merchant_id, req.body, user_data);
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(account_details));
        })
        .catch((error) => {
            console.log(error);
            res.setHeader('Content-Type', 'application/json');
            res.send( JSON.stringify({
                "result": false,
                "err_code": 4
            }));
        })
})

app.post('/withdraw', (req, res) => {
    let transaction_id = req.body.data.transaction_id;
    let response_data;
    const Operations = require('./models/operations');

    res.setHeader('Content-Type', 'application/json');

    Operations
        .findOne({transaction_id:transaction_id})
        .then(result => {
            if (result) {
                response_data = result.response_data;
                res.send(JSON.parse(response_data));
            }
        })
        .then(()=>{
            if (!response_data) {
            }
        })
        .catch((err) => {
            console.log(err);
        })

    // Get user data
    // Users
    //     .findOne({user_id:user_id})
    //     .then((user_data) => {
    //         let withdraw = require('./functions/withdraw');
    //
    //         let operation_data = withdraw.withdraw(salt, merchant_id, req.body, user_data);
    //
    //         console.log('res.send');
    //         res.send(operation_data);
    //     })
    //     .catch((error) => {
    //         console.log(error);
    //         res.setHeader('Content-Type', 'application/json');
    //         res.send( JSON.stringify({
    //             "result": false,
    //             "err_code": 4
    //         }));
    //     })
})

// Https server
const sslServer = https.createServer({
    key: fs.readFileSync(__dirname + '/certificates/key.pem'),
    cert: fs.readFileSync(__dirname + '/certificates/cart.pem')
}, app);

// listen for requests
sslServer.listen(PORT, () => console.log('Secure server on port 443'));