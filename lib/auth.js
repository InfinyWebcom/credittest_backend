const jwt = require('jsonwebtoken');
const Users = require('../models/users');

const authenticateUser = async (req, res, next) => {
    const token = req.headers.token ? req.headers.token : req.query.token;
    const decoded = jwt.decode(token, "credit@#$");
    try {
        let userData = await Users.findById(decoded._id).exec();
        if (!userData || userData == undefined) {
            return res.status(200).json({
                title: 'User not found',
                error: true,
            });
        }
        if (userData.is_deleted === true) {
            return res.status(200).json({
                title: 'User has been deleted by Admin.',
                error: true,
            });
        }
        req.user = userData;
        return next(null, userData);
    }
    catch (error) {
        return res.status(200).json({
            title: 'Authorization required.',
            error: true,
            detail: error
        });
    }
}



module.exports = {
  authenticateUser
}