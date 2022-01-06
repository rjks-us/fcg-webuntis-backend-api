const express = require('express');
const app = express.Router();

const utils = require('../../webuntis/untis')

const {result} = require('../../utils/Structure');

app.get('/classes', async (req, res) => {
    const classes = await utils.classList();
    res.status(200).json(result(200, `All active classes`, classes));
})

app.get('/holidays', async (req, res) => {
    const classes = await utils.holidays();
    res.status(200).json(result(200, `List of all ${classes.length} upcoming holidays`, classes));
})

app.get('/timegrid', async (req, res) => {
    const classes = await utils.getTimeGrid();
    res.status(200).json(result(200, `Current Timegrid`, classes));
})

app.get('/subjects/:class', async (req, res) => {
    if(!req.params.class) res.status(400).json(result(400, `Invalid Request`));

    var now = new Date();
    
    try {
        const sub = await utils.getAllSubjects(req.params.class, new Date(`${now.getUTCMonth() + 1}.01.${now.getFullYear()}`), new Date(`${now.getUTCMonth() + 1}.29.${now.getFullYear()}`));
        res.status(200).json(result(200, `List of all ${sub.length} active subjects in the current month (1.${now.getUTCMonth() + 1} - 29.${now.getUTCMonth() + 1})`, sub));
    } catch (error) {
        console.log(error);
        res.status(200).json(result(200, `List of all ${sub.length} active subjects in the current month (1.${now.getUTCMonth() + 1} - 29.${now.getUTCMonth() + 1})`, []));
    }
})

app.get('/subjectsList/:class', async (req, res) => {
    if(!req.params.class) res.status(400).json(result(400, `Invalid Request`));

    var now = new Date();

    try {
        const sub = await utils.getAllSubjectsOrdered(req.params.class, new Date(`${now.getUTCMonth() + 1}.01.${now.getFullYear()}`), new Date(`${now.getUTCMonth() + 1}.29.${now.getFullYear()}`));

        res.status(200).json(result(200, `List of all active subjects in the current month (1.${now.getUTCMonth() + 1} - 29.${now.getUTCMonth()} + 1)`, sub));
    } catch (error) {
        console.log(error);
        res.status(200).json(result(200, `List of all active subjects in the current month (1.${now.getUTCMonth() + 1} - 29.${now.getUTCMonth()} + 1)`, []));
    }
})

app.get('/timetable/:class/:year/:month/:day', async (req, res) => {
    if(!req.params.class || !req.params.year || !req.params.month || !req.params.day) return res.status(400).json(result(400, `Invalid Request`));

    try {
        const timetable = await utils.getTimeTable(req.params.class, new Date(req.params.month + '/' + req.params.day + '/' + req.params.year));

        res.status(200).json(result(200, `List of all ${timetable.length} subjects`, timetable));
    } catch (error) {
        console.log(error);
        res.status(200).json(result(200, `List of all ${timetable.length} subjects`, []));

    }
})

app.post('/timetable/filter/:class/:year/:month/:day', async (req, res) => {
    if(!req.params.class || !req.body.filter || !req.params.year || !req.params.month || !req.params.day) return res.status(400).json(result(400, `Invalid Request`));

    try {
        if(req.body.filter.length == 0) return res.status(200).json(result(200, `List of all subjects`, []));

        const timetable = await utils.getTimeTableWithFilter(req.params.class, new Date(req.params.month + '/' + req.params.day + '/' + req.params.year), req.body.filter);

        res.status(200).json(result(200, `List of all ${timetable.length} subjects`, timetable));
    } catch (error) {
        return res.status(400).json(result(400, `Invalid Request`));
    }
})

module.exports = app;