const {instance} = require('../../untis');

const express = require('express');
const router = express.Router();

router.get('/list', (req, res) => {
    instance.getClasses().then((classes) => {
        res.status(200).json({status: 200, message: 'List of all aviable classes', data: classes})
    }).catch((err) => res.status(500).json({status: 500, message: 'An internal error accoured'}));
});

router.get('/:id', (req, res) => {
    
});

module.exports = router;