const express = require('express');
const mogodb = require('mongodb');

const app = express.Router();

const {result} = require('../../structure');
const token = require('../../untlis/token')

const devices = require('../../db/user')

const authorize = (req, res, next) => {
    if(!req.headers.authorization) return res.status(401).json(result(401, 'The provided authentication credentials are not valid', []));
    
    token.checkRequest((req.headers.authorization).split(' ')[1])
        .then(async (result) => {
            const id = result.data.id;
            if(!await devices.deviceExists(id) || result.data.type === 'R') return res.status(401).json(result(401, 'The provided authentication credentials are not valid', []));

            req.id = id;

            await devices.logRequest(id, req);
            next()
        })
        .catch(() => res.status(401).json(result(401, 'The provided authentication credentials are not valid', [])))
}

app.get('/me', authorize, async (req, res) => {
    const user = await devices.getProfile(req.id).catch(() => {
        res.status(404).json(result(404, 'Your profile does not exists anymore, because it may be deleted'))
    });

    res.status(200).json(result(200, `Userprofile for ${user.name}`, user));
});

app.post('/create-device', async (req, res) => {
    if(!req.body.name || !req.body.push || !req.body.platform || !req.body.device || !req.body.courses || !req.body.class && req.body.courses instanceof Array) return res.status(400).json(result(400, 'The request is invalid'));
    
    const device = await devices.createDevice(req.body);

    res.status(200).json(result(200, `Device successfully registered`, {token: await token.generateToken(mogodb.ObjectId(device.insertedId), 'T'), refresh: await token.generateToken(mogodb.ObjectId(device.insertedId), 'R')}));
});

app.post('/delete', authorize, async (req, res) => {

    await devices.deleteDevice(req.id).catch((err) => {
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
        res.status(200).json(result(200, `Your identity has been approved, a new token family was created`, newtoken));
    })
});

app.post('/update/course', authorize, async (req, res) => {
    if(!req.body.courses || !req.body.courses instanceof Array) return res.status(400).json(result(400, 'The request is invalid'));

    await devices.updateCourse(req.id, req.body.courses).catch((err) => {
        return res.status(500).json(result(500, `No changes were made, please contact the developer`));
    }).then((status) => {
        if(status) return res.status(200).json(result(200, `Your updated your profile courses`, {courses: req.body.courses}));
        else res.status(200).json(result(404, `Unable to update your profile`));
    });
});

app.post('/update/class', authorize, async (req, res) => {
    if(!req.body.class || !Number.isInteger(req.body.class)) return res.status(400).json(result(400, 'The request is invalid'));

    await devices.updateClass(req.id, req.body.class).catch((err) => {
        return res.status(500).json(result(500, `No changes were made, please contact the developer`));
    }).then((status) => {
        if(status) return res.status(200).json(result(200, `Your updated your profile class`, {class: req.body.class}));
        else res.status(200).json(result(404, `Unable to update your profile`));
    });
});

app.post('/update/token', authorize, async (req, res) => {
    if(!req.body.token || !req.body.token instanceof String) return res.status(400).json(result(400, 'The request is invalid'));

    await devices.updatePushToken(req.id, req.body.token).catch((err) => {
        return res.status(500).json(result(500, `No changes were made, please contact the developer`));
    }).then((status) => {
        if(status) return res.status(200).json(result(200, `Your updated the push token`, {token: req.body.token}));
        else res.status(200).json(result(404, `Unable to update your profile`));
    });
});

app.post('/update/name', authorize, async (req, res) => {
    if(!req.body.name || !req.body.name instanceof String) return res.status(400).json(result(400, 'The request is invalid'));

    if(req.body.name.length > 31 || req.body.name.length < 2) return res.status(400).json(result(400, `The username has to be between 1 and 30 chars`));

    await devices.updateName(req.id, req.body.name).catch((err) => {
        return res.status(500).json(result(500, `No changes were made, please contact the developer`));
    }).then((status) => {
        if(status) return res.status(200).json(result(200, `Your updated your profile name`, {name: req.body.name}));
        else res.status(200).json(result(404, `Unable to update your profile`));
    });
});

module.exports = app;