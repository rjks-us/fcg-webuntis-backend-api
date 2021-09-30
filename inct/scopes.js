/**
 * @description Scopes are used to manage permissions for different api keys
 */
module.exports = {
    ADMINISTRATION: {id: 1, name: 'ADMINISTRATION', description: 'Allows you to access all API endpoints'},
    EDITPLAN: {id: 2, name: 'EDITPLAN', description: 'Allows you to edit spesific classes'},
    MOTD: {id: 3, name: 'MOTD', description: 'Allows you to access the message oof the day'},
    VERSION: {id: 4, name: 'VERSION', description: 'Allows you to access version controll'},
    ALERT: {id: 5, name: 'ALERT', description: 'Allows you to access alert for all applications'},
    PUSH: {id: 6, name: 'PUSH', description: 'Allows you to send push notifications to groups or spesific users, dont mess with this one guys'},
    MANAGEKEY: {id: 7, name: 'MANAGEKEY', description: 'Allows you to create api keys'}
}