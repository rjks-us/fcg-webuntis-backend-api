const WebUntisLib = require('webuntis');

const config = require('./config.json');

var untis = new WebUntisLib(config.api.SCHOOL, config.api.USER, config.api.PASSWORD, config.api.HOST);

untis.login().then(async () => {
    const result = await untis.getTimetableForRange(new Date('01.02.2022'), new Date('01.02.2022'), 242, WebUntisLib.TYPES.CLASS);

    console.log(result);
})