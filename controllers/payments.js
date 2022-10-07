const Users = require('../models/users');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const { validationResult } = require("express-validator");
const paymnetModel = require('../models/payments');


const listing = (req, res) => {
    let query = {}
    if(req.body.Id){
        query = { customer_id: ObjectId(req.body.Id) }
    }
    let limit = req.body.Id ? 5 : 50;
    paymnetModel.find(query).populate('customer_id').sort({createdAt: -1}).limit(limit).then(data => {
        if(data) {
            res.status(200).json({
                error: false,
                data
            })
        } else {
            res.status(200).json({
                error: true,
                data: []
            })
        }
    })
}

module.exports = {
    listing
}