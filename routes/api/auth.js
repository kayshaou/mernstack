const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const userModel = require('../../models/User');
const { check, validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
// @route GET api/auth
// @desc Test route
// @access public
router.get('/', auth ,async (req, res) => {
    // res.send('Auth routes');
    try{
        const user = await userModel.findById(req.user.id).select('-password');
        res.status(200).json(user);
    }catch(err){
        console.error(err.message);
        res.status(500).json({msg: 'Unauthorized'});
    }
})

// @route POST api/users
// @desc Test route
// @access public
router.post('/', 
    [
        check('email', 'Email is required').isEmail(),
        check('password','Password is required').exists()
    ]
    ,async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){ //if there's error
            return res.status(400).json({ errors: errors.array()});
        }
        // Destructuring the variables from body  
        const {
            email, 
            password
        } = req.body;

        try{  
            //use await instead of promise so we don't have to do the .then catch etc...
            
            let user = await userModel.findOne({email})
            // if user already exists send error message
            if(!user){
                return res.status(400).json(
                    {errors : 
                        [{msg: 'Invalid Credentials'}]
                });
            }
            // check if password matched 
            const isMatch = await bcrypt.compare(password, user.password);

            if(!isMatch){
                return res.status(400).json(
                    {errors : 
                        [{msg: 'Invalid Credentials'}]
                });
            }
            // return jsonwebtoken
            const payload = {
                user : {
                 id: user.id
                }
                
            }
            jwt.sign(payload, 
                config.get('jwtSecretKey'),
                {expiresIn: 36000},
                (err, token) => {
                    if(err){
                        throw err
                    }
                    console.log('all good');
                    res.json({token});
                }
            );

           // res.send('User saved..');
        } catch(err){
            console.log(err.message);
            res.status(500).send('Server error');
        }

        //console.log(req.body); //This will not work until we bring in bodyParser middleware
        //res.send('User routes' + req.body);
    }
);


module.exports = router;