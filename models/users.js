var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    name: String,
    email: String,
    password: String,
    user_type: {
        type: String,
        enum: ['admin', 'user']
    },
    card: mongoose.Schema.Types.Mixed,
    is_invite_accepted: {
        type: Boolean,
        default: false
    },
    is_deleted: {
        type: Boolean,
        default: false
    },
    stripe_cust_id: String,
    stripe_payment_id: String,
    braintree_cust_id: String
},
{
    timestamps: true
});

const user = module.exports = mongoose.model('user', schema);

module.exports.getUserByEmail = async(req, cb) => {
    let data = await user.findOne({email: req.body.email}).exec();
    return data
}