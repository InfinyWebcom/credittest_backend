var express = require('express');
var router = express.Router();
var express = require('express');
var router = express.Router();
var userController = require('../controllers/users');
const { check } = require('express-validator');
var auth = require('../lib/auth')


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/login',[
  check('email','Email is required').isEmail(),
  check('password','Password is required').notEmpty()
], (req, res, next) => {
  userController.login(req, res);
});

router.post('/addUser', [
  check('name','Name is required').notEmpty(),
  check('email','Email is required').isEmail()
], [ auth.authenticateUser ], function(req, res) {
  userController.addUser(req, res);
});

router.post('/editUser', [
  check('name','Name is required').notEmpty(),
  check('email','Email is required').isEmail(),
  check('Id','Id is required').notEmpty(),
], [ auth.authenticateUser ], function(req, res) {
  userController.editUser(req, res);
});

router.post('/deleteUser', [
  check('Id','Id is required').notEmpty()
], [ auth.authenticateUser ], function(req, res) {
  userController.deleteUser(req, res);
});

router.get('/user_details', [
  check('Id','Id is required').notEmpty()
], [ auth.authenticateUser ], function(req, res) {
  userController.userDetails(req, res);
});

router.post('/addAdmin', [
  check('name','Name is required').notEmpty(),
  check('email','Email is required').isEmail(),
  check('password','Password is required').notEmpty(),
], function(req, res) {
  userController.addAdmin(req, res);
});

router.post('/listing',[ auth.authenticateUser ], (req, res, next) => {
  userController.listing(req, res);
});

router.get('/getUsers',[ auth.authenticateUser ], (req, res, next) => {
  userController.getUsers(req, res);
});

module.exports = router;
