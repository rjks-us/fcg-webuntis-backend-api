const express = require('express');
const app = express.Router();

const {result} = require('../../structure');

const utils = require('../../untis');

app.get('/classes', async (req, res) => {
    const classes = await utils.classList();
    res.status(200).json(result(200, `List of all ${classes.length} active classes`, classes));
})

app.get('/holidays', async (req, res) => {
    const classes = await utils.holidays();
    res.status(200).json(result(200, `List of all ${classes.length} upcoming holidays`, classes));
})

app.get('/subjects/:class', async (req, res) => {
    if(!req.params.class) res.status(400).json(result(400, `Invalid Request`));

    const sub = await utils.getAllSubjects(req.params.class, new Date('10.25.2021'), new Date('10.29.2021'));
    res.status(200).json(result(200, `List of all ${sub.length} active subjects`, sub));
})

app.get('/timetable/:class/:year/:month/:day', async (req, res) => {
    if(!req.params.class || !req.params.year || !req.params.month || !req.params.day) res.status(400).json(result(400, `Invalid Request`));

    const timetable = await utils.getTimeTable(req.params.class, new Date(req.params.month + '/' + req.params.day + '/' + req.params.year));

    res.status(200).json(result(200, `List of all ${timetable.length} subjects`, timetable));
})


module.exports = app;