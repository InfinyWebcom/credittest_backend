var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    customer_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'user'
    },
    type: String,
    payment_object: mongoose.Schema.Types.Mixed 
},
{
    timestamps: true
});

const payment = module.exports = mongoose.model('payment', schema);


//  {
//     id: 'evt_3KYl9SSDnBZpxPUE1AtV6jH7',
//     object: 'event',
//     api_version: '2020-08-27',
//     created: 1646200506,
//     data: {
//       object: {
//         id: 'pi_3KYl9SSDnBZpxPUE1JFnwOjj',
//         object: 'payment_intent',
//         amount: 2000,
//         amount_capturable: 0,
//         amount_received: 0,
//         application: null,
//         application_fee_amount: null,
//         automatic_payment_methods: null,
//         canceled_at: null,
//         cancellation_reason: null,
//         capture_method: 'automatic',
//         charges: [Object],
//         client_secret: 'pi_3KYl9SSDnBZpxPUE1JFnwOjj_secret_4dvwGsgXfNRNfAcaQqKLkiHp8',
//         confirmation_method: 'automatic',
//         created: 1646200506,
//         currency: 'usd',
//         customer: null,
//         description: '(created by Stripe CLI)',
//         invoice: null,
//         last_payment_error: null,
//         livemode: false,
//         metadata: {},
//         next_action: null,
//         on_behalf_of: null,
//         payment_method: null,
//         payment_method_options: [Object],
//         payment_method_types: [Array],
//         processing: null,
//         receipt_email: null,
//         review: null,
//         setup_future_usage: null,
//         shipping: [Object],
//         source: null,
//         statement_descriptor: null,
//         statement_descriptor_suffix: null,
//         status: 'requires_payment_method',
//         transfer_data: null,
//         transfer_group: null
//       }
//     },
//     livemode: false,
//     pending_webhooks: 2,
//     request: {
//       id: 'req_khyjZreGS9W1FX',
//       idempotency_key: '88c809e1-78db-4d72-bc01-a10b443fe4e4'
//     },
//     type: 'payment_intent.created'
//   }