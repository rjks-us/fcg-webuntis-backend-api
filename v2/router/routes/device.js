const express = require('express');
const mongoDB = require('mongodb');

const app = express.Router();

const {result} = require('../../utils/Structure');
const token = require('../../utils/Token')

const sessionManagement = require('../../database/commands/session');
const adminManagement = require('../../database/commands/admin');
const manipulizeManagement = require('../../database/commands/manipulizer');
const deviceManagement = require('../../database/commands/device');
const notificationManagement = require('../../database/commands/notification');
const device = require('../../database/commands/device');

const authorize = (req, res, next) => {
    if(!req.headers.authorization) return res.status(401).json(result(401, 'The provided authentication credentials are not valid 1', []));
    
    token.checkRequest((req.headers.authorization).split(' ')[1])
        .then(async (re) => {
            const id = re.data.id;

            if(!await deviceManagement.userProfileExists({_id: mongoDB.ObjectId(id)}) || re.data.type === 'R') return res.status(401).json(result(401, 'The provided authentication credentials are not valid 2', []));

            req.id = id;

            if(await deviceManagement.findUser({_id: mongoDB.ObjectId(req.id), disabled: true})) return res.status(404).json(result(404, 'Your device has been disabled'));

            await deviceManagement.logRequest({_id: mongoDB.ObjectId(id)}, req);
            next()
        })
        .catch((error) => {
            console.log(error);
            return res.status(401).json(result(401, 'The provided authentication credentials are not valid 3', []));
        })
}

app.get('/me', authorize, async (req, res) => {
    const user = await deviceManagement.findUser({_id: mongoDB.ObjectId(req.id)}).catch(() => {
        return res.status(404).json(result(404, 'Your profile does not exists anymore, because it may be deleted'))
    });

    res.status(200).json(result(200, `Userprofile for ${user.name}`, user));
});

app.get('/me/disable', authorize, async (req, res) => {
    const user = await deviceManagement.findUser({_id: mongoDB.ObjectId(req.id)}).catch(() => {
        return res.status(404).json(result(404, 'Your profile does not exists anymore, because it may be deleted'))
    });

    await deviceManagement.disableDevice({_id: mongoDB.ObjectId(req.id)}, true);

    res.status(200).json(result(200, `Profile ${user.name} has been disabled`, {}));
});

app.post('/create-device', async (req, res) => {
    if(!req.body.name || !req.body.push || !req.body.platform || !req.body.device || !req.body.courses || !req.body.class || !req.body.courses instanceof Array) return res.status(400).json(result(400, 'The request is invalid'));
    
    const device = await deviceManagement.createUserDevice(req.body);

    res.status(200).json(result(200, `Device successfully registered`, {token: await token.generateToken(mongoDB.ObjectId(device.insertedId), 'T'), refresh: await token.generateToken(mongoDB.ObjectId(device.insertedId), 'R')}));
});

app.post('/delete', authorize, async (req, res) => {

    await deviceManagement.deleteDevice({_id: mongoDB.ObjectId(req.id)}).catch((err) => {
        return res.status(500).json(result(500, `No changes were made, please contact the developer`));
    }).then((status) => {
        if(status) return res.status(200).json(result(200, `Your account has beed permanently deleted`));
        else res.status(200).json(result(404, `Unable to delete your profile`));
    });
});

app.post('/refresh', async (req, res) => {
    if(!req.body.token || !req.body.refresh) return res.status(400).json(result(400, 'The request is invalid'));

    await token.verifyReset(req.body.token, req.body.refresh).catch((err) => {
        return res.status(400).json(result(400, 'The provided authentication credentials are not valid'));
    }).then((newtoken) => {
        return res.status(200).json(result(200, `Your identity has been approved, a new token family was created`, newtoken));
    })
});

app.post('/update/course', authorize, async (req, res) => {
    if(!req.body.courses || !req.body.courses instanceof Array) return res.status(400).json(result(400, 'The request is invalid'));

    await deviceManagement.updateCourses({_id: mongoDB.ObjectId(req.id)}, req.body.courses).catch((err) => {
        return res.status(500).json(result(500, `No changes were made, please contact the developer`));
    }).then((status) => {
        if(status) return res.status(200).json(result(200, `Your updated your profile courses`, {courses: req.body.courses}));
        else res.status(200).json(result(404, `Unable to update your profile`));
    });
});

app.post('/update/class', authorize, async (req, res) => {
    if(!req.body.class || !Number.isInteger(req.body.class)) return res.status(400).json(result(400, 'The request is invalid'));

    await deviceManagement.updateClass({_id: mongoDB.ObjectId(req.id)}, req.body.class).catch((err) => {
        return res.status(500).json(result(500, `No changes were made, please contact the developer`));
    }).then((status) => {
        if(status) return res.status(200).json(result(200, `Your updated your profile class`, {class: req.body.class}));
        else res.status(200).json(result(404, `Unable to update your profile`));
    });
});

app.post('/update/token', authorize, async (req, res) => {
    if(!req.body.token || !req.body.token instanceof String) return res.status(400).json(result(400, 'The request is invalid'));

    await deviceManagement.updatePushToken({_id: mongoDB.ObjectId(req.id)}, req.body.token).catch((err) => {
        return res.status(500).json(result(500, `No changes were made, please contact the developer`));
    }).then((status) => {
        if(status) return res.status(200).json(result(200, `Your updated the push token`, {token: req.body.token}));
        else res.status(200).json(result(404, `Unable to update your profile`));
    });
});

app.post('/update/name', authorize, async (req, res) => {
    if(!req.body.name || !req.body.name instanceof String) return res.status(400).json(result(400, 'The request is invalid'));

    if(req.body.name.length > 31 || req.body.name.length < 2) return res.status(400).json(result(400, `The username has to be between 1 and 30 chars`));

    await deviceManagement.updateName({_id: mongoDB.ObjectId(req.id)}, req.body.name).catch((err) => {
        return res.status(500).json(result(500, `No changes were made, please contact the developer`));
    }).then((status) => {
        if(status) return res.status(200).json(result(200, `Your updated your profile name`, {name: req.body.name}));
        else res.status(200).json(result(404, `Unable to update your profile`));
    });
});

/**
 * Notifications
 */

app.get('/notifications', authorize, async (req, res) => {

    const notifications = await notificationManagement.findBulkNotification({identifier: mongoDB.ObjectId('61d62be2bb26db1d9821c864')});

    var tmpNotificationRemodelingCollection = [];

    for (let i = 0; i < notifications.length; i++) {
        const element = notifications[i];
        tmpNotificationRemodelingCollection.push({
            iat: element.iat,
            title: element.title,
            message: element.message,
            successfully: element.successfully,
            actionid: {
                id: element.actionid.id,
                description: element.actionid.description
            },
            sender: "AUTOMATIC-BACKEND-SYSTEM"
        });
    }

    res.status(200).json(result(200, 'List of all notifications', tmpNotificationRemodelingCollection))
});

module.exports = app;