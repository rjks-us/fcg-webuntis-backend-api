const express = require('express');
const app = express.Router();

const config = require('../config.json');
const {result} = require('../structure');

app.get('/version', (req, res) => {
    const package = require('../../package.json');

    return res.status(200).json(
        result(200, `${package.name} running on version ${package.version}`, {
            version: package.version, 
            name: package.name,
            author: package.author,
            web: package.homepage
        })
    );
});

app.get('/signature', (req, res) => {
    return res.status(200).json(
        result(200, `Current app signature`, config.signature)
    );
});

module.exports = app;