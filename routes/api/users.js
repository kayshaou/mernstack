const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const UserSchema = require('../../models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
// @route POST api/users
// @desc Test route
// @access public
router.post('/', 
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Email is required').isEmail(),
        check('password','Please enter password with 6 or more characters ').isLength({min:6, max:20})
    ]
    ,async (req, res) => {
        const errors = validationResult(req);

        console.log('name '+req.body.name+' email '+req.body.email+' pasword'+req.body.password);
        if(!errors.isEmpty()){ //if there's error
            return res.status(400).json({ errors: errors.array()});
            // return res.json(errors.array());
        }
        // Destructuring the variables from body  
        const { name, 
            email, 
            password
        } = req.body;

        try{  
            //use await instead of promise so we don't have to do the .then catch etc...
            
            let user = await UserSchema.findOne({email})
            // if user already exists send error message
            if(user){
                return res.status(400).json(
                    {errors : 
                        [{msg: 'User already exists'}]
                });
            }
            // if the user is not found
            // get user gravatar...
            const avatar = gravatar.url(email, {
                s: '200', r: 'pg', d: 'mm'
            })
            // now create new User obj
            user = new User({
                name, email, avatar, password
            })
        
            // encrypt password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            // now save the user
            await user.save();
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
            console.log('backend error'+err.message);
            res.status(500).send('Server error');
        }

        //console.log(req.body); //This will not work until we bring in bodyParser middleware
        //res.send('User routes' + req.body);
    }
);

module.exports = router;