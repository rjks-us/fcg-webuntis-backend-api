const express = require('express');
const router = express.Router();

router.use('/classes', require('./classes'));
router.use('/motd', require('./motd'));
router.use('/table', require('./table'));
router.use('/versions', require('./versions'));
router.use('/teachers', require('./teachers'));

router.get('/*', (req, res) => {
    res.status(404).json({status: 404, message: 'Page not found'});
})

module.exports = router;