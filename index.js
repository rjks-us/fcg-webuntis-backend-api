const express = require('express');

const fs = require('fs');
const path = require('path');

const morgan = require('morgan');

const config = require('./config.json');
const untis = require('./untis');
const app = express();

app.use((err, req, res, next) => {
    if(err.status === 400) return res.status(err.status).json({status: err.status, message: 'Invalid body, please check your json syntax'});
    return next(err);
});

app.use('/v1', require('./api/v1/api'));

/**
 * @async
 * @description Executes the entry point of application
 */
const init = async () => {
    console.log(`[INFO] Application is starting...\n`);
    console.log(`[INFO] FCG-Webuntis-API by Robert J. Kratz`);
    console.log(`[INFO] You found an error? robert.kratz03@gmail.com\n`);
    console.log(`[INFO] Date: ${new Date()}`);
    console.log(`[INFO] Node Version: ${process.version}\n`);
}

app.use(morgan('combined', { stream: fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })}))

init().then(() => {
    app.listen(config.port, () => {
        console.log(`[INFO] Webserver started on http://localhost://$${config.port}`);

        untis.login().then(() => {
            console.log('[INFO] Connected to WebUntis Backend API');
            //untis.update(); //Starts requesting intervall
        }).catch(err => console.error(err));
    })
})