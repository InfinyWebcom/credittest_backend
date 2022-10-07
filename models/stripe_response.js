var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    response: mongoose.Schema.Types.Mixed 
},
{
    timestamps: true
});

const payment = module.exports = mongoose.model('stripe_raw_response', schema);