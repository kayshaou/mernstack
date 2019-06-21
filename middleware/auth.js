const config = require('config');
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    const token = req.header('x-auth-token');
    if(!token){
        // send error msg
        return res.status(401).json({msg: 'No token, authorization denied'})
    }

    // if there is but invalid
    try{
        const decoded = jwt.verify(
            token, 
            config.get('jwtSecretKey')
        )
        // if matched set to req.user
        req.user = decoded.user;
        next()

    } catch(error){
        console.error('error message from auth '+error.message);
        res.status(401).json({msg: 'Token is not valid'})
    }
}