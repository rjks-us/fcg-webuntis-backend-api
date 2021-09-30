const untis = require('webuntis');
const {instance, getClass} = require('../../untis');

const express = require('express');
const router = express.Router();

router.get('/:id', (req, res) => {
    if(req.params.id === undefined) return res.status(400).json({status: 400, message: 'You must provide a class'});
    
    getClass(req.params.id).then((result) => {
        instance.getTimetableForToday(result.id, untis.TYPES.CLASS).then((table) => {
            res.status(200).json({status: 200, message: 'Table from', id: result.id, data: [table]});
        }).catch(err => res.status(400).json({status: 400, message: 'This class could not be found', data: [err]}));
    }).catch(err => res.status(400).json({status: 400, message: 'This class could not be found', data: [err]}));
});

module.exports = router;