const express = require('express');
const mogodb = require('mongodb');
const jwt = require('jsonwebtoken');

const app = express.Router();

const {result} = require('../../structure');

const admin = require('../../db/admin')
const device = require('../../db/user')
const motd = require('../../db/motd')
const manipulizer = require('../../db/manipu')

const crypto = require('../../untlis/crypto')
const token = require('../../untlis/token')
const config = require('../../config.json');
const scope = require('../../untlis/scope');

const authorize = async (req, res, next) => {
    if(!req.headers.authorization) return res.status(401).json(result(401, 'The provided authentication credentials are not valid', []));

    const token = (req.headers.authorization).split(' ')[1];

    await jwt.verify(token, config.keys.JWT, async (err, id) => {
        if(err) res.status(401).json(result(401, 'Unauthorized'));

        const user = await admin.findUser({'_id': mogodb.ObjectId(id.id)});

        req.id = user._id;
        req.scopes = user.scopes;
        req.name = user.name;

        await admin.logRequest(id.id, req).then(() => next());
    })
}

app.post('/signup', authorize, async (req, res) => {
    if(!scope.hasScope(req.scopes, 11)) return res.status(401).json(result(401, 'You are lacking the permission 11'));

    const body = req.body;

    if(!body.name || !body.email || !body.scopes || !body.password && !body.scopes instanceof Array) return res.status(400).json(result(400, 'Bad request'));

    //Check username
    if (await admin.findUser({name: body.name})) return res.status(400).json(result(400, 'Username already exists'));

    //Check email
    if (await admin.findUser({name: body.email})) return res.status(400).json(result(400, 'Email already exists'));

    var entry = await admin.createUser(body);

    return res.status(201).json(result(201, 'User model created', [{userid: mogodb.ObjectId(entry.insertedId)}]));
});

app.post('/login', async (req, res) => {

    const body = req.body;

    console.log(body);

    if(!body || !body.username || !body.password) return res.status(400).json(result(400, 'Bad request'));

    console.log(1);

    var user = await admin.findUser({name: body.username});
    if(!user) return res.status(401).json(result(400, 'Wrong credentials 1'));

    console.log(2);

    var password = await crypto.check(body.password, user.password);

    if(!password) return res.status(401).json(result(400, 'Wrong credentials 2'));

    console.log(3);


    res.status(200).json(result(200, 'Authenticated', [{token: await token.generateAdminToken(mogodb.ObjectId(user._id)), type: 'Bearer'},]));

    await admin.logRequest(user._id, req);
});

app.get('/me', authorize, async (req, res) => {

    const user = await admin.findUser({'_id': mogodb.ObjectId(req.id)});

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

    const user = await admin.findUser({'_id': mogodb.ObjectId(req.params.id)});

    if(!user) return res.status(404).json(result(404, 'The profile was not found'));

    var tmp = {
        name: user.name,
        scopes: user.scopes,
        iat: user.iat,
    };

    if(scope.hasScope(req.scopes, 91)) {
        tmp.id = mogodb.ObjectId(req.params.id);
        tmp.email = user.email,
        tmp.access = user.access
    }

    return res.status(200).json(result(200, 'User profile', [tmp]))
})


//TODO: fix error, no results are found in db by enpty query
app.get('/users', authorize, async (req, res) => {
    if(!scope.hasScope(req.scopes, 91)) return res.status(401).json(result(401, 'You are lacking the permission 91'));

    const users = await admin.findBulkUser( {} ), tmp = [];

    if(!users) return res.status(404).json(result(404, 'No profiles were found'));

    users.forEach(user => {
        tmp.push({
            id: mogodb.ObjectId(req.params.id),
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

    const success = await admin.updateScopes(body.id, body.scopes);

    if(success) return res.status(202).json(result(202, 'User scopes updated', body.scopes));

    return res.status(500).json(result(500, 'Unnable to update user scopes', body.scopes));
});


app.post('/manipulize', authorize, async (req, res) => {
    if(!scope.hasScope(req.scopes, 3)) return res.status(401).json(result(401, 'You are lacking the permission 3'))
    
    const body = req.body;

    if(!body || !body.rayid || !body.class || !body.course) return res.status(400).json(result(400, 'Bad request'));

    if(body.status.type != 0 && body.status.type != 1 && body.status.type != 2) return res.status(400).json(result(400, 'Type id must be a nnumber between 0 and 2'));

    body.iat = Date.now();
    body.creator = mogodb.ObjectId(req.id);

    const exists = await manipulizer.findEntry({rayid: body.rayid});

    if(exists) {
        await manipulizer.updateEntry(body);
        return res.status(201).json(result(201, 'Update deployed', [body]));
    }

    const success = await manipulizer.addEntry(body)
    
    if(success) return res.status(201).json(result(201, 'Changes deployed', [body]));

    return res.status(500).json(result(500, 'Unable to deploy changes'));
});

app.get('/manipulize/list', authorize, async (req, res) => {
    if(!scope.hasScope(req.scopes, 3)) return res.status(401).json(result(401, 'You are lacking the permission 3'))
    
    const entrys = await manipulizer.findBulkEntry({});

    if(!entrys) return res.status(404).json(result(404, 'No entrys found'))

    res.status(200).json(result(200, 'List of all changes in timetable', entrys));
});

app.get('/devices', authorize, async (req, res) => {
    if(!scope.hasScope(req.scopes, 5)) return res.status(401).json(result(401, 'You are lacking the permission 5'))

    const devices = await device.findBulkUser({}), tmp = [];

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

app.post('/message/deploy', authorize, async (req, res) => {
    if(!scope.hasScope(req.scopes, 4)) return res.status(401).json(result(401, 'You are lacking the permission 4'))
    
    const body = req.body;

    if(!body || !body.message || !body.date || !body.date.day || !body.date.month || !body.date.year) return res.status(400).json(result(400, 'Bad request'));

    if(body.type != 0 && body.type != 1 && body.type != 2) return res.status(400).json(400, 'Type id must be a number between 0 and 2');

    if(!body.classes) {
        body.classes = -1;
    }

    if(!body.push) {
        body.push = false;
    }

    body.creator = mogodb.ObjectId(req.id);

    const success = await motd.addEntry(body)
    
    if(success) return res.status(201).json(result(201, 'Changes deployed'));

    return res.status(404).json(result(500, 'Unable to deploy changes'));
});

app.get('/message/list', authorize, async (req, res) => {
    if(!scope.hasScope(req.scopes, 4)) return res.status(401).json(result(401, 'You are lacking the permission 4'))

    const elements = await motd.findBulkEntry({});

    if(!elements || elements.length == 0) return res.status(404).json(result(404, 'No entries found'))

    return res.status(200).json(result(200, 'Active message list', elements));
});

app.post('/message/delete', authorize, async (req, res) => {
    if(!scope.hasScope(req.scopes, 41)) return res.status(401).json(result(401, 'You are lacking the permission 41'))

    const body = req.body;

    if(!body || !body.id) res.status(400).json(result(400, 'Bad request'));

    const success = await motd.deleteEntry(body.id);

    console.log(success);

    if(success) return res.status(202).json(result(202, 'Element successfully deleted'));

    return res.status(404).json(result(500, 'Unable to deploy changes'));
});

app.post('/push', authorize, (req, res) => {
    //TODO: implement push notifications
});

module.exports = app;