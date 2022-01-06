const express = require('express');
const app = express.Router();

const config = require('../../static/config.json');
const {result} = require('../../utils/Structure');

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

app.get('/scopes', (req, res) => {
    return res.status(200).json(
        result(200, `Aviable scopes`, require('../../scopes.json').scopes)
    );
});

module.exports = app;