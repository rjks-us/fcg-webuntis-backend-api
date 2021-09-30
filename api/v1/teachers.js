const {instance} = require('../../untis');

const express = require('express');
const router = express.Router();

router.get('/list', (req, res) => {
    instance.getTeachers().then((ta) => {
        res.status(200).json({status: 200, message: 'List of all aviable teachers', data: ta})
    }).catch((err) => res.status(500).json({status: 500, message: 'An internal error accoured', data: [err]}));
});

router.get('/:id', (req, res) => {
    
});

module.exports = router;