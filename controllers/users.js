const Users = require('../models/users');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const helper = require('../lib/helper');
const ObjectId = mongoose.Types.ObjectId;
const randomstring = require('randomstring');
const { validationResult } = require("express-validator");
const StripeCtrl = require('../controllers/stripe');
const BrainCtrl = require('../controllers/braintree');

const login = (req, res) => {
    const result = validationResult(req);

    if (result.errors.length > 0) {
        return res.status(200).json({
            error: true,
            title: result.errors[0].msg,
            errors: result,
        });
    }
    Users.findOne({ email: req.body.email.trim().toLowerCase() })
    .exec((err, userData) => {
        if (err) {
            return res.status(200).json({
                title: "Something went wrong. Please try again.",
                error: true
            })
        }
        if (!userData) {
            return res.status(200).json({
                title: "You have entered an invalid username or password",
                error: true
            });
        }

        if (!bcrypt.compareSync(req.body.password, userData.password)) {
            return res.status(200).json({
                title: 'You have entered an invalid username or password',
                error: true
            });
        } else {
            if(userData.is_invite_accepted === false){
                Users.findOneAndUpdate({ _id: ObjectId(userData._id) }, { $set: { is_invite_accepted: true } }).exec();
                StripeCtrl.addCustomerHelper(userData);
                BrainCtrl.addCustomerHelper(userData);
            }
            helper.generateToken(userData, (token) => {
                return res.status(200).json({
                    title: 'Login successful.',
                    error: false,
                    token: token,
                    detail: userData
                });
            });
        }
    });
}

const addUser = async(req, res) => {
    const result = validationResult(req);

    if (result.errors.length > 0) {
        return res.status(200).json({
            error: true,
            title: result.errors[0].msg,
            errors: result,
        });
    }
    let password = randomstring.generate({
        length: 6,
        charset: 'alphanumeric'
    });
    let userExists = await Users.getUserByEmail(req);
    if(userExists){
        return res.status(200).json({
            error: true,
            title: 'User already exist.'
        })
    }
    let { name, email } = req.body;
    let newUser = new Users({
        name: name,
        email: email.toLowerCase().trim(),
        user_type: 'user',
        password: bcrypt.hashSync(password, bcrypt.genSaltSync(10))
    })
    newUser.save((err, data) => {
        if(err){
            res.status(200).json({
                error: true,
                title: 'Something went wrong.'
            })
        } else {
            let mailData = {};
            mailData.email = data.email;
            mailData.subject = 'Invitation from Credit Mountain';
            mailData.body =  `<p>You have invitation from Credit Mountain please use the following credentails <a href=${process.env.url}>Here</a>. <br/>
                Email: ${data.email}<br/>Password: ${password}</p> `;
            helper.sendEmail(mailData);
            res.status(200).json({
                error: false,
                title: 'User added successfully.'
            })
        }
    })
}

const editUser = async(req, res) => {
    const result = validationResult(req);

    if (result.errors.length > 0) {
        return res.status(200).json({
            error: true,
            title: result.errors[0].msg,
            errors: result,
        });
    }

    let userExists = await Users.getUserByEmail(req);
    if(!userExists){
        return res.status(200).json({
            error: true,
            title: `User doesn't exist.`
        })
    }
    let { name, email, Id } = req.body;
    Users.findOneAndUpdate({ _id: ObjectId(Id) }, { $set: { name: name, email: email } }).then(data => {
        if(!data){
            res.status(200).json({
                error: true,
                title: 'Something went wrong.'
            })
        } else {
            res.status(200).json({
                error: false,
                title: 'User data updated successfully.'
            })
        }
    })
}

const deleteUser = async(req, res) => {
    const result = validationResult(req);

    if (result.errors.length > 0) {
        return res.status(200).json({
            error: true,
            title: result.errors[0].msg,
            errors: result,
        });
    }

    let userExists = await Users.getUserByEmail(req);
    if(!userExists){
        return res.status(200).json({
            error: true,
            title: `User doesn't exist.`
        })
    }
    let { Id } = req.body;
    Users.findOneAndUpdate({ _id: ObjectId(Id) }, { $set: { is_deleted: true, email: userExists.email+'_isDeleted' } }).then(data => {
        if(!data){
            res.status(200).json({
                error: true,
                title: 'Something went wrong.'
            })
        } else {
            res.status(200).json({
                error: false,
                title: 'User deleted successfully.'
            })
        }
    })
}

const listing = (req, res) => {
    let query = { user_type: 'user', is_deleted: false, is_invite_accepted: true }
    if (req.body.searchText) {
        query = {
            ...query, $or: [
                { "email": { $regex: req.body.searchText, $options: 'i' } },
                { "name": { $regex: req.body.searchText, $options: 'i' } }
            ]
        }
    }
    let limit = req.body.perPage ? Number(req.body.perPage) : parseInt(100);
    let skip = (parseInt(req.body.page ? req.body.page : 1) - 1) * parseInt(limit);
    Users.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).then((data) => {
        Users.countDocuments(query).then((count) => {
            let details = { data, count }
            res.status(200).json({
                title: 'success',
                error: false,
                details
            })
        })
    })
}

const addAdmin = (req,res) => {
    const result = validationResult(req);

    if (result.errors.length > 0) {
        return res.status(200).json({
            error: true,
            title: result.errors[0].msg,
            errors: result,
        });
    }
    let { email, name, password } = req.body;
    let newUser = new Users({
        email,
        name,
        password: bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
        user_type: 'admin'
    })
    newUser.save((err, save) => {
        if(err){
            res.status(200).json({
                error: true,
                title: 'Something went wrong.'
            })
        } else {
            res.status(200).json({
                error: false,
                title: 'Admin added successfully.'
            })
        }
    })
}

const userDetails = async(req, res) => {
    const result = validationResult(req);

    if (result.errors.length > 0) {
        return res.status(200).json({
            error: true,
            title: result.errors[0].msg,
            errors: result,
        });
    }
    let { Id } = req.query;
    Users.findOne({ _id: ObjectId(Id) }).then(data => {
        if (!data) {
            res.status(200).json({
                error: true,
                title: 'Something went wrong.'
            })
        } else {
            res.status(200).json({
                error: false,
                data,
                title: 'User details fetched successfully.'
            })
        }
    })
}

const getUsers = (req, res) => {
    Users.find({ user_type: 'user', is_invite_accepted: true }, { _id: 1, name: 1, stripe_cust_id: 1, stripe_payment_id: 1, braintree_cust_id: 1 }).sort({ name: 1 }).then(data => {
        if(data){
            res.status(200).json({
                error: false,
                data,
                title: 'Users fetched successfully.'
            })
        } else {
            res.status(200).json({
                error: true,
                title: 'No users found.'
            })
        }
    })
}
module.exports = {
    login,
    addUser,
    editUser,
    deleteUser,
    listing,
    addAdmin,
    userDetails,
    getUsers
}