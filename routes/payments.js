var express = require('express');
var router = express.Router();
var auth = require('../lib/auth');
const { check } = require('express-validator');
var paymentCtrl = require('../controllers/payments');

router.post('/listing', [ auth.authenticateUser ], (req, res) => {
    paymentCtrl.listing(req, res)
})


module.exports = router;
