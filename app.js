const express = require('express');
const https = require('https');
const fs = require('fs');
const mongoose = require('mongoose');

const Users = require('./models/users');

const app = express();
const PORT = 443;

const salt = 'get_balance';

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));

// DB connection
const dbURI = 'mongodb+srv://new-user:test12345@cluster0.wodilhl.mongodb.net/node-tuts?retryWrites=true&w=majority';
mongoose
    .connect(dbURI)
    .then((result) => console.log('connected to db'))
    .catch((err) => console.log(err));

app.get('/', (req, res) => {
    // Template data
    Users
        .find()
        .then((users_data) => res.render('users', { title: 'Users', users_data}))
        .catch((error) => {
            console.log(error);
        })
})

app.get('/users', (req, res) => {
    res.redirect('/');
});

app.post('/get_balance', (req, res) => {
    const utils = require('./functions/utils');
    let time = utils.getTime();
    let user_id = req.body.user_id;

    let params = new Map([
        ['user_id', user_id],
        ['merchant_id', 0],
    ]);

    let sorted_params = utils.paramsSort(params);
    let hash = utils.sha256(time, sorted_params, salt);
    let signature = hash.digest('hex');

    Users
        .findById(user_id)
        .then((user_data) => {
            const get_balanse = require('./functions/get_balance');
            let balanse = get_balanse.get_balance(salt, time, signature, user_data);
            res.send(JSON.stringify(balanse));
        })
        .catch((error) => {
            console.log(error);
            res.send( JSON.stringify({
                "result": false,
                "err_code": 4
            }));
        })
})

// Error 404
app.use((req, res) => {
    res.status(404).render('404', { title: '404'});
})

const sslServer = https.createServer({
    key: fs.readFileSync(__dirname + '/certificates/key.pem'),
    cert: fs.readFileSync(__dirname + '/certificates/cart.pem')
}, app);

sslServer.listen(PORT, () => console.log('Secure server on port 443'));