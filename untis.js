const WebUntisLib = require('webuntis');

const config = require('./config.json');

/**
 * @description Webuntis instance connecting to Untis API
 * @returns Promise<any>
 */
const login = new Promise(async (resolve, rejects) => {
    try {
        const instance = await new WebUntisLib.WebUntisAnonymousAuth(config.api.SCHOOL, config.api.HOST);
        resolve(instance);
    } catch (error) {
        rejects('Could not authenticate to the WebUntis API');
    }
});

/**
 * @description Webuntis instance disconnecting to Untis API
 * @returns Promise<any>
 */
const logout = new Promise((resolve, rejects) => {

});

module.exports = {
    login: login,
    logout: logout
}