const express = require('express');

const fs = require('fs');
const path = require('path');

const morgan = require('morgan');

const config = require('./config.json');
const untis = require('./untis');

const {result} = require('./structure');

const app = express();

const date = Date.now();

app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use((err, req, res, next) => {
    if(err.status === 400) return res.status(err.status).json(result(err.status, `Invalid body, please check your json syntax`));
    else return next(err);
});

app.use('/v1', require('./api/v1/app'));
app.use('/', require('./api/application'));

/**
 * @async
 * @description Executes the entry point of application
 */
const init = async () => {
    try {await fs.promises.access('logs');} catch (error) {await fs.promises.mkdir('logs');}

    fs.writeFile(__dirname + `/logs/${date}.log`, '', {flag: 'wx', encoding: 'utf8'}, (err) => {
        if(err) throw new Error(err);
    })

    app.use(morgan('combined', { stream: fs.createWriteStream(path.join(__dirname, `/logs/${date}.log`), { flags: 'a' })}));

    console.log(`[INFO] Application is starting...\n`);
    console.log(`[INFO] FCG-Webuntis-API by Robert J. Kratz`);
    console.log(`[INFO] You found an error? robert.kratz03@gmail.com\n`);
    console.log(`[INFO] Date: ${new Date()}`);
    console.log(`[INFO] Node Version: ${process.version}\n`);
}

init().then(() => {
    untis.login().then(() => {
        console.log('[INFO] Connected to WebUntis Backend API');
        //Webserver starts when connected to WebUntis API
        app.listen(config.port, () => {
            console.log(`[INFO] Webserver started on http://localhost:${config.port}/`);
        })
        require('./untis/cacher').update();
    }).catch(err => console.error(err));
});