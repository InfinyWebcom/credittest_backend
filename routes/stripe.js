var express = require('express');
var router = express.Router();
var auth = require('../lib/auth');
const { check } = require('express-validator');
var stripeCtrl = require('../controllers/stripe');
const stripe = require('stripe')(process.env.stripe_key);

router.post('/addCard',[
  check('Id','Id is required').notEmpty(),
  check('cardnumber','Card number is required').notEmpty(),
  check('expirydate','Exp date is required').notEmpty(),
  check('cvvcode','Cvc is required').notEmpty(),
  check('cardname','Card number is required').notEmpty()
], (req, res) => {
  stripeCtrl.addCard(req, res)
})

router.post('/addCustomer',[
  check('Id','Id is required').notEmpty()
], (req, res) => {
  stripeCtrl.addCustomer(req, res)
})

router.post('/create-payment-intent',[
    check('Id','Id is required').notEmpty(),
    check('amount','Amount is required').notEmpty(),
    check('customer_token','Customer token is required').notEmpty(),
    check('card_token', 'Card token is required').notEmpty()
  ], (req, res) => {
    stripeCtrl.charge(req, res)
})

router.post('/test', (req, res) => {
  stripeCtrl.test(req, res)
})

router.get('/addNewCard', async (req, res) => {
  stripeCtrl.addNewCard(req, res);
});

router.post('/pay', async (req, res) => {
  stripeCtrl.pay(req, res);
})

module.exports = router;
