const actions = require('./Action.json');
const frebaseadmin = require('./firebase-mainframe');

const notificationHandler = require('../database/commands/notification');
const { ObjectId } = require('mongodb');

module.exports = {
    Notification: class Notification {

        constructor(title, body) {
            this.title = title;
            this.body = body;
            this.iat = Date.now();
        }

        /**
         * Sends a single push Notification to the targetted device
         * @param {String} firebaseDeviceId 
         * @param {String} userDeviceLogAccount If set, the notification is saved to the notification database
         * @param {JSON} action 
         */
        async sendSingle(firebaseDeviceId, userDeviceLogAccount, action, sender) {
            const message = {
                notification: {
                    title: this.title,
                    body: this.body
                },
                token: firebaseDeviceId
            }

            var successfull = true;
        
            try {
                const response = await frebaseadmin.messaging().send(message);

                console.log('[FCM] Successfully sent message: ' + response);        
            } catch (error) {
                successfull = false;
                console.log('[FCM] Error while sending message: ' + error);
            }

            if(userDeviceLogAccount !== undefined) await notificationHandler.createNotification({
                title: message.notification.title,
                message: message.notification.body,
                success: successfull,
                identifier: ObjectId(userDeviceLogAccount),
                actionid: action,
                sender: (sender) ? sender : 'AUTOMATIC-BACKEND-SYSTEM'
            });

        }

        sendBulk(firebaseDeviceIDCollection) {
            const message = {
                notification: {
                    title: this.title,
                    body: this.body
                },
                tokens: firebaseDeviceIDCollection
            }

            frebaseadmin.messaging().sendMulticast(message).then(response => {
                if (response.failureCount > 0) {
                    const failedTokens = [];
                    response.responses.forEach((resp, idx) => {
                      if (!resp.success) {
                        failedTokens.push(registrationTokens[idx]);
                      }
                    });
                    console.log('List of tokens that caused failures: ' + failedTokens);
                  }
            }).catch(error => {
                console.log('Error while sending message: ' + error);
            })
        }
    },
    actions: actions
}