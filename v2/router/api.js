const express = require('express');
const app = express.Router();

const {result} = require('../utils/Structure');

app.use('/v1/devices', require('./routes/device'));
app.use('/v1/admin', require('./routes/admin'));
app.use('/v1', require('./routes/untis'));
app.use('/', require('./routes/public'));

app.all('/*', (req, res) => {
    res.status(404).json(result(404, 'This page could not be found'))
})

module.exports = app;