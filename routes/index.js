var express = require('express');
var router = express.Router();
var stripeCtrl = require('../controllers/stripe');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Credit Mountain' });
});

router.get('/config', function(req, res, next) {
  res.json({ publishableKey: process.env.publishableKey });
});

router.post('/webhook', function(req, res, next) {
  stripeCtrl.webhook(req, res);
});

module.exports = router;
