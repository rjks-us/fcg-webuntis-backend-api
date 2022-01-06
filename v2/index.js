const express = require('express');

const fs = require('fs');
const path = require('path');
const cors = require('cors');

const morgan = require('morgan');

const config = require('./static/config.json');
const defaultRootUser = require('./static/defaultuser.json').default;

const untis = require('./webuntis/untis');
const db = require('./database/manager')

const {Notification, actions} = require('./notification/notificationhandler')
const admin = require('./database/commands/admin');

const {result} = require('./utils/Structure');

const app = express();

const date = Date.now();

app.use(cors());

app.use(express.urlencoded({extended: true}));
app.use(express.json());

//Prevent invalid body input
app.use((err, req, res, next) => {
    if(err.status === 400) return res.status(err.status).json(result(err.status, `Invalid body, please check your json syntax`));
    else return next(err);
});

app.use('/', require('./router/api'));

/**
 * @async
 * @description Executes the entry point of application
 */
const init = async () => {
    try {await fs.promises.access(__dirname + '/logs');} catch (error) {await fs.promises.mkdir(__dirname + '/logs');}

    fs.writeFile(__dirname + `/logs/${date}.log`, '', {flag: 'wx', encoding: 'utf8'}, (err) => {
        if(err) throw new Error(err);
    });

    app.use(morgan('combined', { stream: fs.createWriteStream(path.join(__dirname, `/logs/${date}.log`), { flags: 'a' })}));

    console.log(`[INFO] Application is starting...\n`);
    console.log(`[INFO] FCG-Webuntis-API by Robert J. Kratz`);
    console.log(`[INFO] You found an error? robert.kratz03@gmail.com\n`);
    console.log(`[INFO] Date: ${new Date()}`);
    console.log(`[INFO] Node Version: ${process.version}\n`);

    const fc = await new Notification('Stundenplanänderung', 'Der Englisch LK (E-LK) bei Tilly Rolle fällt morgen aus');

    //fc.sendSingle('co8WlaSiTLuC19A1417W2A:APA91bEYSdjyVYxLIMbf6PZM-5wJ5bNgs9JwFvtIiyKimnVrIJEDzeoYXm_FFGMYcREwlJgxUCX7q7AYzxcG9-stmmSNWrrIYyjOdTsZV8NJ5nm1i1aqXTs5VyVS6UbX32YI-wdeVtQE');
}

init().then(() => {
    
    //Untis
    untis.login().then(() => {
        console.log('[INFO] Connected to WebUntis Backend API');

        //MongoDB
        db.login().then(async () => {
            console.log('[INFO] Connected to MongoDB Cloud Database');

            if(!await admin.findUser({name: defaultRootUser.name})) {
                await admin.createDefaultRootUser();
                console.log('[INFO] The default root user was created');
            }

            //Express
            app.listen(config.port, () => {
                console.log(`[INFO] Webserver started on http://localhost:${config.port}/`);
                if(config.workers.cacher) require('./cacher/caching').update();
            })
        }).catch(err => console.error(err));
    }).catch(err => console.error(err));
});