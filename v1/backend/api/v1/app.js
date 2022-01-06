const express = require('express');
const app = express.Router();

const {result} = require('../../structure');

const utils = require('../../untis');
const modt = require('../../db/motd')

app.use('/devices', require('./device'));
app.use('/admin', require('./admin'));

app.get('/classes', async (req, res) => {
    const classes = await utils.classList();

    res.status(200).json(result(200, `List of all ${classes.length} active classes`, classes));
})

app.get('/today', async (req, res) => {
    console.log({classes: -1, date: {day: (new Date().getDate()), month: (new Date().getMonth() + 1), year: (new Date().getFullYear())}});

    const today = await utils.getToday(), motd = await modt.findBulkEntry({classes: -1}), tmp = [];

    motd.forEach(messages => {
        if(messages.date.day == (new Date().getDate()) && messages.date.month == (new Date().getMonth() + 1) && messages.date.year == (new Date().getFullYear()))
        tmp.push({
            id: messages._id,
            type: messages.type,
            message: messages.message,
            classes: messages.classes,
            iat: messages.iat,
            date: messages.date
        })
    });

    res.status(200).json(result(200, `List of todays activities`, {holidays: today, messages: tmp}));
})

app.get('/today/:year/:month/:day/', async (req, res) => {
    if(!req.params.year || !req.params.month || !req.params.day) return res.status(400).json(result(400, 'Bad request'));

    const today = await utils.getToday(), motd = await modt.findBulkEntry({classes: -1}), tmp = [];

    motd.forEach(messages => {
        if(req.params.day == messages.date.day && req.params.month == messages.date.month && req.params.year == messages.date.year)
        tmp.push({
            id: messages._id,
            type: messages.type,
            message: messages.message,
            classes: messages.classes,
            iat: messages.iat,
            date: messages.date
        })
    });

    res.status(200).json(result(200, `List of todays activities`, {holidays: today, messages: tmp}));
})

app.get('/today/:year/:month/:day/:course', async (req, res) => {
    if(!req.params.year || !req.params.month || !req.params.day || !req.params.course) return res.status(400).json(result(400, 'Bad request'));

    const today = await utils.getToday(), motd = await modt.findBulkEntry({}), tmp = [];

    motd.forEach(messages => {
        if((req.params.course == messages.classes || messages.classes == -1) && req.params.day == messages.date.day && req.params.month == messages.date.month && req.params.year == messages.date.year) 
        tmp.push({
            id: messages._id,
            type: messages.type,
            message: messages.message,
            classes: messages.classes,
            iat: messages.iat,
            date: messages.date
        })
    });

    res.status(200).json(result(200, `List of todays activities`, {holidays: today, messages: tmp}));
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
    
    const sub = await utils.getAllSubjects(req.params.class, new Date(`${now.getUTCMonth()}.01.${now.getFullYear()}`), new Date(`${now.getUTCMonth()}.29.${now.getFullYear()}`));
    res.status(200).json(result(200, `List of all ${sub.length} active subjects in the current month (1.${now.getUTCMonth()} - 29.${now.getUTCMonth()})`, sub));
})

app.get('/subjectsList/:class', async (req, res) => {
    if(!req.params.class) res.status(400).json(result(400, `Invalid Request`));

    var now = new Date();

    const sub = await utils.getAllSubjectsOrdered(req.params.class, new Date(`${now.getUTCMonth() + 1}.01.${now.getFullYear()}`), new Date(`${now.getUTCMonth() + 1}.29.${now.getFullYear()}`));

    res.status(200).json(result(200, `List of all active subjects in the current month (1.${now.getUTCMonth() + 1} - 29.${now.getUTCMonth()})`, sub));
})

app.get('/timetable/:class/:year/:month/:day', async (req, res) => {
    if(!req.params.class || !req.params.year || !req.params.month || !req.params.day) return res.status(400).json(result(400, `Invalid Request`));

    const timetable = await utils.getTimeTable(req.params.class, new Date(req.params.month + '/' + req.params.day + '/' + req.params.year));

    res.status(200).json(result(200, `List of all ${timetable.length} subjects`, timetable));
})

app.post('/timetable/filter/:class/:year/:month/:day', async (req, res) => {

    console.log(req.body);

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