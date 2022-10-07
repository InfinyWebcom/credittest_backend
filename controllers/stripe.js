const Users = require('../models/users');
const mongoose = require('mongoose');
const request = require("request");
const ObjectId = mongoose.Types.ObjectId;
const { validationResult } = require("express-validator");
const stripe = require('stripe')(process.env.stripe_key);
const stripeModel = require('../models/stripe_response');
const paymnetModel = require('../models/payments');


const addCard = async (req, res) => {
    const result = validationResult(req);

    if (result.errors.length > 0) {
        return res.status(200).json({
            error: true,
            title: result.errors[0].msg,
            errors: result,
        });
    }
    let Id = req.body.Id;
    let userData = await Users.findById(Id).exec();
    let year = (req.body.expirydate).toString().slice(3, 7);
    let month = (req.body.expirydate).toString().slice(0, 2);
    console.log('asdjamskd=-=-=t11-', month, year)
    let token;
    stripe.sources.create({
        type: 'card',
        currency: 'usd',
        owner: {
            email: 'credit10@mailinator.com'
        },
        card: {
            number: req.body.cardnumber,
            exp_month: Number(month),
            exp_year: Number(year),
            cvc: req.body.cvvcode,
        }
    },async function (err, source) {
        // asynchronously called
        console.log('error->', err)
        console.log('source->', source)
        if (source) {

            try {
                token = await stripe.tokens.create({
                    card: {
                        number: req.body.cardnumber,
                        exp_month: Number(month),
                        exp_year: Number(year),
                        cvc: req.body.cvvcode,
                    }
                });
            } catch (e) {
                return res.status(200).json({
                    error: true,
                    title: 'Card not added.',
                    data: e
                });
            }
            if (token) {
                let newCard = {
                    no: (req.body.cardnumber).toString().slice(10, 14),
                    name: req.body.cardname,
                    exp: req.body.expirydate
                }
                Users.findOneAndUpdate({ _id: ObjectId(Id) }, { $set: { card_token: token.id, card_added: token, source: source, card: newCard } },{new: true}).then(data=> console.log('-=-=-=-=-==data',data));
                return res.status(200).json({
                    error: false,
                    title: 'Card added successfully.',
                    token
                });
            } else {
                return res.status(200).json({
                    error: true,
                    title: 'Card not added.'
                });

            }
        } else {
            return res.status(200).json({
                error: true,
                title: `Couldn't generate source.`
            });
        }

    });
}

const addCustomer = async (req, res) => {
    const result = validationResult(req);

    if (result.errors.length > 0) {
        return res.status(200).json({
            error: true,
            title: result.errors[0].msg,
            errors: result,
        });
    }
    let Id = req.body.Id;
    let userData = await Users.findById(Id).exec();
    var options = {
        'method': 'POST',
        'url': `https://api.stripe.com/v1/customers`,
        'headers': {
            'Authorization': `Bearer ${process.env.stripe_key}`
        },
        'data': {
            name: userData.name,
            email: userData.email,
            description: ''
        }
    };

    request(options, function (error, response) {
        if (error) {
            return res.status(200).json({
                error: true,
                title: 'Error while adding customer in stripe',
                data: error,
            });
        }
        let data = JSON.parse(response.body);
        Users.findOneAndUpdate({ _id: ObjectId(Id) }, { $set: { customer_added: data, customer_token: data.id } }).exec();
        console.log('asdjamskd=-=-=response-', JSON.parse(response.body))
        return res.status(200).json({
            error: false,
            title: 'Customer added successfully.',
            data
        });
    })
}

const addCustomerHelper = async (data) => {
    let customer;
    try {
        customer = await stripe.customers.create({
            name: data.name,
            email: data.email,
            description: 'My First Test Customer (created for API docs)',
        });
        console.log('asod-=-=-=cuss', customer)
        if (customer) {
            Users.findOneAndUpdate({ _id: ObjectId(data._id) }, { $set: { stripe_cust_id: customer.id } }).exec();
        }
    } catch (e) {
        console.log('asod-=-=-=error', e)
    }
}

const charge = async (req, res) => {

    const result = validationResult(req);

    if (result.errors.length > 0) {
        return res.status(200).json({
            error: true,
            title: result.errors[0].msg,
            errors: result,
        });
    }
    let Id = req.body.Id;
    let userData = await Users.findById(Id).exec();
    try {
        const charge = await stripe.charges.create({
            amount: Number(req.body.amount),
            currency: 'usd',
            source: userData.source .id,
            customer: req.body.customer_token,
            // card: req.body.card_token,
            description: 'My First Test Charge (created for API docs)',
        });
        console.log('asdmasodmaks-=-charge', charge)
        if (charge) {
            // insert data in payments
            return res.status(200).json({
                error: false,
                title: 'Customer added successfully.',
                data
            });
        } else {
            return res.status(200).json({
                error: true,
                title: 'Something went wrong.',
            });
        }
    } catch (error) {
        return res.status(200).json({
            error: true,
            title: 'Something went wrong.',
            error
        });
    }

}

const test = async(req, res) => {

    const paymentIntent = await stripe.paymentIntents.create({
        amount: 10990,
        currency: 'inr',
        payment_method_types: ['card'],
        metadata: {
            customer:'cus_LDSPg5wih9efWe'
        }
      });
      const clientSecret = paymentIntent.clientSecret;
      res.json({ clientSecret })
      console.log('-=-=-=1',paymentIntent)
      const paymentIntentConfirm = await stripe.paymentIntents.confirm(
        paymentIntent.id,
        {payment_method: 'pm_card_visa'}
      );
      console.log('-=-=-=2',paymentIntentConfirm)
}

const addNewCard = async(req, res) =>{
    let url = process.env.url;
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'setup',
        customer: req.query.customer_id,
        success_url: `${url}/users/details/${req.query.Id}?session_id=${Date.now()}&status=success`,
        cancel_url: `${url}/users/details/${req.query.Id}?status=failed`,
    });
    res.send(session.url);
}

const webhook = (req, res) => {
    let type = (req.body.type).toLowerCase().trim();
    console.log('-=-=-=->webhook',req.body)
    if(type){
       if( type == 'setup_intent.succeeded' ) {
            Users.findOneAndUpdate({ stripe_cust_id: req.body.data.object.customer }, { $set: { stripe_payment_id: req.body.data.object.payment_method } }).exec();
        } else if( type == 'charge.succeeded' ) {
            let newPay = new paymnetModel({ customer_id: req.body.data.object.metadata.Id, type: type, payment_object: req.body })
            newPay.save();
        } else if ( type == 'payment_method.attached' ){
            Users.findOneAndUpdate({ stripe_cust_id: req.body.data.object.customer }, { $set: { card: req.body.data.object.card } }).exec();
        } else if (type == 'payment_intent.payment_failed' || type == 'payment_intent.succeeded') {
            let newPay = new paymnetModel({ customer_id: req.body.data.object.metadata.Id, type: type, payment_object: req.body })
            newPay.save();
        } else {
            let newData = new stripeModel({ response: req.body })
            newData.save();
        }
        
        res.status(200).json({ title: 'success' }); 
    }else {
        res.status(500).json({ title: 'Type is null' });
    }
}

const pay = async(req, res) => {
    try {
        let { amount, payment_method, customer, Id } = req.body;
        let amt = amount * 100;
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amt,
          currency: "inr",
          customer,
          payment_method,
          metadata: {
            Id: Id
          }      
        });
    
        const clientSecret = paymentIntent.client_secret;
        const cpaymentIntent = await stripe.paymentIntents.confirm(
          paymentIntent.id,
          // {payment_method: 'pm_card_visa'}
        );
        res.json({ clientSecret, message: "Payment Initiated", data: cpaymentIntent  });
        
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
      }
}
module.exports = {
    addCard,
    webhook,
    addCustomer,
    charge,
    addCustomerHelper,
    addNewCard,
    test,
    pay
}