const express = require('express');
const mongoDB = require('mongodb');

const scope = require('../../utils/Scopes');
const crypto = require('../../utils/Crypto');
const sessionManagement = require('../../database/commands/session');
const adminManagement = require('../../database/commands/admin');
const manipulizeManagement = require('../../database/commands/manipulizer');
const deviceManagement = require('../../database/commands/device');

const {Notification, actions} = require('../../notification/notificationhandler');
const {result} = require('../../utils/Structure');

const app = express.Router();

const authorize = async (req, res, next) => {

    if(!req.headers.authorization) return res.status(401).json(result(401, 'The provided authentication credentials are not valid 1 ', []));

    const token = (req.headers.authorization).split(' ')[1];

    await sessionManagement.verifySession(token).then((sessionResult) => {

        if(!sessionResult) return res.status(401).json(result(401, 'The provided authentication credentials are not valid 2', []));

        sessionManagement.getBodyOfSession(token).then(async (body) => {

            const user = await adminManagement.findUser({_id: mongoDB.ObjectId(body.userid)});

            req.id = user._id;
            req.scopes = user.scopes;
            req.name = user.name;
            req.token = token;

            await adminManagement.logRequest(user.id, req).then(() => next());

        }).catch(error => {
            res.status(401).json(result(401, 'The provided authentication credentials are not valid 3', []))
            console.log(error);
        });


    }).catch(error => {
        res.status(401).json(result(401, 'The provided authentication credentials are not valid 4', []))
        console.log(error);
    });
}

app.post('/signup', authorize, async (req, res) => {

    const noPermission = () => res.status(401).json(result(401, 'You are lacking the permission 11'));

    if(!scope.hasScope(req.scopes, 11)) return noPermission();

    const body = req.body;

    if(!body.name || !body.email || !body.scopes || !body.password && !body.scopes instanceof Array) return res.status(400).json(result(400, 'Bad request'));

    //Check username
    if (await adminManagement.findUser({name: body.name})) return res.status(400).json(result(400, 'Username already exists'));

    //Check email
    if (await adminManagement.findUser({name: body.email})) return res.status(400).json(result(400, 'Email already exists'));

    var entry = await adminManagement.createUserProfile(body);

    return res.status(201).json(result(201, 'User model created', [{userid: mongoDB.ObjectId(entry.insertedId)}]));
});

app.post('/login', async (req, res) => {
    const body = req.body;

    if(!body || !body.username || !body.password) return res.status(400).json(result(400, 'Bad request'));

    var user = await adminManagement.findUser({name: body.username});
    if(!user) return res.status(401).json(result(400, 'Wrong credentials 1'));

    var password = await crypto.check(body.password, user.password);

    if(!password) return res.status(401).json(result(400, 'Wrong credentials 2'));

    const token = await sessionManagement.createSession(user._id.toString(), {});

    console.log(user);

    res.status(200).json(result(200, 'Authenticated', {token: token, type: 'Bearer', expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180), scopes: user.scopes},));

    await adminManagement.logRequest(user._id, req);
});

app.post('/logout', authorize, async (req, res) => {
    
    const success = await sessionManagement.endSession(req.token);

    if(!success) return res.status(401).json(result(404, 'Your session is invalid'));

    return res.status(200).json(result(404, 'Your session token is now expired'));
})

app.get('/me', authorize, async (req, res) => {
    const user = await adminManagement.findUser({'_id': mongoDB.ObjectId(req.id)});

    if(!user) return res.status(404).json(result(404, 'Your profile was not found'));

    return res.status(200).json(result(200, 'User profile', [{
        name: user.name,
        email: user.email,
        scopes: user.scopes,
        iat: user.iat,
        access: user.access
    }]))
});

app.get('/user/:id', authorize, async (req, res) => {
    if(!req.params.id) return res.status(400).json(result(400, 'Bad request'))

    const user = await adminManagement.findUser({'_id': mongoDB.ObjectId(req.params.id)});

    if(!user) return res.status(404).json(result(404, 'The profile was not found'));

    var tmp = {
        name: user.name,
        scopes: user.scopes,
        iat: user.iat,
    };

    if(scope.hasScope(req.scopes, 91)) {
        tmp.id = mongoDB.ObjectId(req.params.id);
        tmp.email = user.email,
        tmp.access = user.access
    }

    return res.status(200).json(result(200, 'User profile', [tmp]))
})

app.get('/users', authorize, async (req, res) => {
    if(!scope.hasScope(req.scopes, 91)) return res.status(401).json(result(401, 'You are lacking the permission 91'));

    const users = await adminManagement.findBulkUser( {} ), tmp = [];

    if(!users) return res.status(404).json(result(404, 'No profiles were found'));

    users.forEach(user => {
        tmp.push({
            id: mongoDB.ObjectId(req.params.id),
            name: user.name,
            scopes: user.scopes,
            iat: user.iat,
            email: user.email,
            access: user.access
        })
    });

    return res.status(200).json(result(200, 'User Database', users))
});

app.post('/update/scope', authorize, async (req, res) => {
    if(!scope.hasScope(req.scopes, 1)) return res.status(401).json(result(401, 'You are lacking the permission 1'))

    const body = req.body;

    if(!body.id || !body.scopes && !body.scopes instanceof Array) return res.status(400).json(result(400, 'Bad request'));

    const success = await adminManagement.updateScopes({_id: mongoDB.ObjectId(body.id)}, body.scopes);

    if(success) return res.status(202).json(result(202, 'User scopes updated', body.scopes));

    return res.status(500).json(result(500, 'Unnable to update user scopes', body.scopes));
});

app.post('/manipulize', authorize, async (req, res) => {
    if(!scope.hasScope(req.scopes, 3)) return res.status(401).json(result(401, 'You are lacking the permission 3'))
    

    const body = req.body;

    console.log(body);

    if(!body || !body.rayid || !body.class || !body.course) return res.status(400).json(result(400, 'Bad request'));

    if(body.status.type != 0 && body.status.type != 1 && body.status.type != 2) return res.status(400).json(result(400, 'Type id must be a number between 0 and 2'));

    body.iat = Date.now();
    body.creator = mongoDB.ObjectId(req.id);

    const exists = await manipulizeManagement.findEntry({rayid: body.rayid});

    if(exists) {
        await manipulizeManagement.updateEntry({rayid: body.rayid}, body.status.type, body.status.message);
        return res.status(201).json(result(201, 'Update deployed', [body]));
    }

    const success = await manipulizeManagement.addEntry(body)
    
    if(success) return res.status(201).json(result(201, 'Changes deployed', [body]));

    return res.status(500).json(result(500, 'Unable to deploy changes'));
});

app.get('/manipulize/list', authorize, async (req, res) => {
    if(!scope.hasScope(req.scopes, 3)) return res.status(401).json(result(401, 'You are lacking the permission 3'))
    
    const entrys = await manipulizeManagement.findBulkEntrys({});

    if(!entrys) return res.status(404).json(result(404, 'No entrys found'))

    res.status(200).json(result(200, 'List of all changes in timetable', entrys));
});

app.post('/pushNotification/single', authorize, async (req, res) => {
    if(!scope.hasScope(req.scopes, 6)) return res.status(401).json(result(401, 'You are lacking the permission 6'))

    const body = req.body;

    if(!body || !body.target || !body.message || !body.title) return res.status(400).json(result(400, 'Bad request'));

    try {
        const device = await deviceManagement.findUser({_id: mongoDB.ObjectId(body.target)});

        if(!device) return res.status(404).json(result(401, 'The provided user does not exist'));

        const pushNotificationToken = await deviceManagement.getMostRecentFirebasePushNotificationKey({_id: mongoDB.ObjectId(body.target)});

        if(!pushNotificationToken) return res.status(404).json(result(404, 'The provided user did not allow notifications'));
        
        const notif = new Notification((body.title + '').replaceAll('%name%', device.name), (body.message).replaceAll('%name%', device.name));

        await notif.sendSingle(pushNotificationToken.token, mongoDB.ObjectId(body.target), actions.CUSTOM_NOTIFICATION, mongoDB.ObjectId(req.id));

        return res.status(200).json(result(200, 'The user recived the push Notification'));
    } catch (error) {
        console.log(error);
        return res.status(404).json(result(401, 'The provided user does not exist'))
    }
});

app.post('/pushNotification/all', authorize, async (req, res) => {
    if(!scope.hasScope(req.scopes, 6)) return res.status(401).json(result(401, 'You are lacking the permission 6'))

    const body = req.body;

    if(!body || !body.message || !body.title) return res.status(400).json(result(400, 'Bad request'));

    try {
        const device = await deviceManagement.findBulkUser({});

        if(!device) return res.status(404).json(result(401, 'The provided user does not exist'));

        var amount = 0;

        for (let i = 0; i < device.length; i++) {
            const element = device[i];

            const pushNotificationToken = await deviceManagement.getMostRecentFirebasePushNotificationKey({_id: mongoDB.ObjectId(element._id)});

            if(pushNotificationToken) {
                const notif = new Notification((body.title).replaceAll('%name%', element.name), (body.message).replaceAll('%name%', element.name));

                await notif.sendSingle(pushNotificationToken.token, mongoDB.ObjectId(element._id), actions.CUSTOM_NOTIFICATION, mongoDB.ObjectId(req.id));
                amount++;
            }
        }
        return res.status(200).json(result(200, amount + ' devices recived the notification'));
    } catch (error) {
        console.log(error);
        return res.status(501).json(result(501, 'An error occoured'))
    }
});

app.post('/pushNotification/class', authorize, async (req, res) => {
    if(!scope.hasScope(req.scopes, 6)) return res.status(401).json(result(401, 'You are lacking the permission 6'))

    const body = req.body;

    if(!body || !body.target || !body.message || !body.title) return res.status(400).json(result(400, 'Bad request'));

    try {
        const device = await deviceManagement.findBulkUser({class: body.target});

        if(!device) return res.status(404).json(result(401, 'The provided user does not exist'));

        var amount = 0;

        for (let i = 0; i < device.length; i++) {
            const element = device[i];

            const pushNotificationToken = await deviceManagement.getMostRecentFirebasePushNotificationKey({_id: mongoDB.ObjectId(element._id)});

            if(pushNotificationToken) {
                const notif = new Notification((body.title).replaceAll('%name%', element.name), (body.message).replaceAll('%name%', element.name));

                await notif.sendSingle(pushNotificationToken.token, mongoDB.ObjectId(element._id), actions.CUSTOM_NOTIFICATION, mongoDB.ObjectId(req.id));
                amount++;
            }
        }
        return res.status(200).json(result(200, amount + ' devices recived the notification'));
    } catch (error) {
        console.log(error);
        return res.status(501).json(result(501, 'An error occoured'))
    }
});

app.post('/pushNotification/subject', authorize, async (req, res) => {
    if(!scope.hasScope(req.scopes, 6)) return res.status(401).json(result(401, 'You are lacking the permission 6'))

    const body = req.body;

    if(!body || !body.target || !body.message || !body.title) return res.status(400).json(result(400, 'Bad request'));

    try {
        const device = await deviceManagement.findBulkUser({courses: {$in: [subjects]}});

        if(!device) return res.status(404).json(result(401, 'The provided user does not exist'));

        var amount = 0;

        for (let i = 0; i < device.length; i++) {
            const element = device[i];

            const pushNotificationToken = await deviceManagement.getMostRecentFirebasePushNotificationKey({_id: mongoDB.ObjectId(element._id)});

            if(pushNotificationToken) {
                const notif = new Notification((body.title).replaceAll('%name%', element.name), (body.message).replaceAll('%name%', element.name));

                await notif.sendSingle(pushNotificationToken.token, mongoDB.ObjectId(element._id), actions.CUSTOM_NOTIFICATION, mongoDB.ObjectId(req.id));
                amount++;
            }
        }
        return res.status(200).json(result(200, amount + ' devices recived the notification'));
    } catch (error) {
        console.log(error);
        return res.status(501).json(result(501, 'An error occoured'))
    }
});

app.post('/pushNotification/subjects', authorize, async (req, res) => {
    if(!scope.hasScope(req.scopes, 6)) return res.status(401).json(result(401, 'You are lacking the permission 6'))

    const body = req.body;

    if(!body || !body.target || !body.message || !body.title) return res.status(400).json(result(400, 'Bad request'));

    try {
        const device = await deviceManagement.findBulkUser({courses: {$in: subjects}});

        if(!device) return res.status(404).json(result(401, 'The provided user does not exist'));

        var amount = 0;

        for (let i = 0; i < device.length; i++) {
            const element = device[i];

            const pushNotificationToken = await deviceManagement.getMostRecentFirebasePushNotificationKey({_id: mongoDB.ObjectId(element._id)});

            if(pushNotificationToken) {
                const notif = new Notification((body.title).replaceAll('%name%', element.name), (body.message).replaceAll('%name%', element.name));

                await notif.sendSingle(pushNotificationToken.token, mongoDB.ObjectId(element._id), actions.CUSTOM_NOTIFICATION, mongoDB.ObjectId(req.id));
                amount++;
            }
        }
        return res.status(200).json(result(200, amount + ' devices recived the notification'));
    } catch (error) {
        console.log(error);
        return res.status(501).json(result(501, 'An error occoured'))
    }
});

app.get('/devices', authorize, async (req, res) => {
    if(!scope.hasScope(req.scopes, 5)) return res.status(401).json(result(401, 'You are lacking the permission 5'))

    const devices = await deviceManagement.findBulkUser({}), tmp = [];

    await devices.forEach(device => {
        tmp.push({
            name: device.name,
            platform: device.platform,
            device: device.device,
            courses: device.courses,
            class: device.class,
            notification: device.notification,
            iat: device.iat,
            access: device.access
        })
    });

    return res.status(200).json(result(200, 'List of all registered devices', tmp));
});

module.exports = app;