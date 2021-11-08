const express = require('express');
const fs = require('fs');
const path = require('path');

const morgan = require('morgan');
const cors = require('cors');

const config = require('./config.json');

const app = express();

const date = Date.now();

app.use(cors());
app.use(express.static(__dirname + '/page'))

app.get('', (req, res) => {
    console.log('123');
    fs.readFile('./page/index.html', (err, data) => {
        res.status(200).send(data);
    })
})

/**
 * @async
 * @description Executes the entry point of application
 */
 const init = async () => {
    try {await fs.promises.access(__dirname + '/logs');} catch (error) {await fs.promises.mkdir(__dirname + '/logs');}

    fs.writeFile(__dirname + `/logs/${date}.log`, '', {flag: 'wx', encoding: 'utf8'}, (err) => {
        if(err) throw new Error(err);
    })

    app.use(morgan('combined', { stream: fs.createWriteStream(path.join(__dirname, `/logs/${date}.log`), { flags: 'a' })}));

    console.log(`[INFO] Application is starting...\n`);
    console.log(`[INFO] FCG-App Website by Robert J. Kratz`);
    console.log(`[INFO] You found an error? robert.kratz03@gmail.com\n`);
    console.log(`[INFO] Date: ${new Date()}`);
    console.log(`[INFO] Node Version: ${process.version}\n`);
}

init().then(() => {
    app.listen(config.port, () => {
        console.log(`[INFO] Webserver started on http://localhost:${config.port}/`);
    })
})