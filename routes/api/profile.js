const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const profileSchema = require('../../models/Profile');
const userSchema = require('../../models/User');
const {check, validationResult} = require('express-validator/check');
const request = require('request');
const config = require('config');
// @route GET api/profile/me
// @desc Test route
// @access public
router.get('/me',  auth, async (req, res) => {
    //res.send('Profile routes');
    try{
        // if profile is found.. show the details. 

        const profile = await profileSchema.findOne({user: req.user.id}).populate('user', ['name','avatar'])
        if(profile){
            res.status(200).json(profile);
        }
        return res.status(400).json({msg: 'User profile not found...'})

    } catch(err){
        console.error(err.message);
        res.status(401).json({error: 'Server error'});
    }
})

// @route post api/profile/
// @desc Create or Update user profile
// @access private
router.post('/', 
    [
        auth, 
        [
            check('status','Status is required..').not().isEmpty(),
            check('skills', 'Skills are required').not().isEmpty()
        ]
    ]
    ,async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){ //if there's error
            return res.status(400).json({ errors: errors.array()});
        }

        //if not start to create user obj
        const {
            company,
            website,
            location,
            status,
            skills,
            bio,
            githubusername,
            experience,
            education,
            youtube,
            twitter, instagram, linkedin, facebook
        } = req.body;

        const profileObj = {};
        profileObj.user = req.user.id;

        if(company) profileObj.company = company;
        if(website) profileObj.website = website;
        if(location) profileObj.location = location;
        if(status) profileObj.status = status;
        
        if(bio) profileObj.bio = bio;
        if(githubusername) profileObj.githubusername = githubusername;

        if(skills) {
            profileObj.skills = skills.split(',').map(skills => skills.trim());
        }

        // social
        profileObj.social = {}
        if(facebook) profileObj.social.facebook = facebook;
        if(instagram) profileObj.social.instagram = instagram;
        if(linkedin) profileObj.social.linkedin = linkedin;
        if(youtube) profileObj.social.youtube = youtube;
        if(twitter) profileObj.social.twitter = twitter;

        // now check whether to update or create a new one
        try {
            let profile = await profileSchema.findOne({user: req.user.id});
            if(profile){
                //do the update
                profile = await profileSchema.findOneAndUpdate(
                    { user: req.user.id },
                    { $set : profileObj },
                    { new: true } //to return the modified documents
                )
                console.log('updated...');
                return res.json(profile);
            }

            // create new one 
            profile = new profileSchema(profileObj);
            await profile.save();
            res.json(profile);
        } catch(err){
            console.error(err.message);
            res.status(500).send('Server error');
        }
        




})


// @route get api/profile/all
// @desc get all profiles
// @access public
router.get('/all', async (req, res) => {
    try{
        // fetch all available profile with no conditions
        const profiles = await profileSchema.find().populate('user', ['name', 'avatar']);
        res.send(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({msg: 'Server error'});
    }
});


// @route get api/profile/:id
// @desc get profile by user id
// @access public
router.get('/user/:user_id', async (req, res) => {
    try{
        // fetch all available profile with no conditions
        const profile = await profileSchema.findOne({user: req.params.user_id}).populate('user', ['name', 'avatar']);

        console.log(profile);

        if(!profile){
            return res.status(400).json({msg: 'Theres no such user' })
        }
        res.send(profile);
    } catch (err) {
        console.error(err.message);
        if(err.kind == 'ObjectId'){
            return res.status(400).json({msg: 'Theres no such user' });
        } else {
        res.status(500).json({msg: 'Server error'});
        }
    }
});

// @route get api/profile/all
// @desc get all profiles
// @access public
router.get('/all', async (req, res) => {
    try{
        // fetch all available profile with no conditions
        const profiles = await profileSchema.find().populate('user', ['name', 'avatar']);
        res.send(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({msg: 'Server error'});
    }
});


// @route delete api/profile
// @desc delete profile, user & posts
// @access private
router.delete('/', auth ,async (req, res) => {
    try{
        console.log('what is uid '+req.user.id);
        // Remove profile
        await profileSchema.findOneAndRemove({ user: req.user.id});
        // Remove user
        await userSchema.findOneAndRemove({_id: req.user.id});
        console.log('..deleted successfully');
        res.json({msg: 'User deleted..'});
    } catch (err) {
        console.error(err.message);
        res.status(500).json({msg: 'Server error'});
    }
});

// @route get api/profile/all
// @desc get all profiles
// @access public
router.get('/all', async (req, res) => {
    try{
        // fetch all available profile with no conditions
        const profiles = await profileSchema.find().populate('user', ['name', 'avatar']);
        res.send(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({msg: 'Server error'});
    }
});

// @route put api/profile/experience
// @desc  add profile
// @access private
router.put('/experience', 
    [auth,
        [
            check('title','Title is required').not().isEmpty(),
            check('company','Company is required').not().isEmpty(),
            check('location','Location is required').not().isEmpty(),
            check('From','From is required').not().isEmpty(),
        ]
    ], async (req, res) => {
        const errors = validationResult(req.body);

        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array()});
        }

        try {
            const profile = await profileSchema.findOne({user: req.user.id});

            if(profile){
                const {
                    title,
                    company,
                    location,
                    from,
                    to,
                    current,
                    description
                } = req.body; 

                const newExp = {
                    title, 
                    company,
                    location,
                    from,
                    to,
                    current,
                    description
                }

                profile.experience.unshift(newExp);
                

                await profile.save();
                console.log('experience added...');
                res.json(profile);
            }
            
        } catch (error) {
            console.error(error.message);
            res.status(500).json({msg: 'Server error'});
        }
    } 
);

// @route delete api/profile/experience
// @desc  delete experience
// @access private
router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await profileSchema.findOne({user: req.user.id});
        if(profile){
            // const removedIdx = await profile.experience.map(item => item.)
            const removingIdx = profile.experience.findIndex(item=> item.id === req.params.exp_id);
             console.log(`index found ${removingIdx}`);

        
            if(removingIdx!=-1){
                profile.experience.splice(removingIdx);
            }

            res.json(profile);
            await profile.save();
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({msg: 'Server error'});
    }
    
    }
);

// @route put api/profile/education
// @desc  add profile
// @access private
router.put('/education', 
    [auth,
        [
            check('school','School is required').not().isEmpty(),
            check('degree','degree is required').not().isEmpty(),
            check('fieldofstudy','fieldofstudy is required').not().isEmpty(),
            check('from','From is required').not().isEmpty(),
        ]
    ], async (req, res) => {
        const errors = validationResult(req.body);

        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array()});
        }

        try {
            const profile = await profileSchema.findOne({user: req.user.id});

            if(profile){
                const {
                    school,
                    degree,
                    fieldofstudy,
                    from,
                    to,
                    current,
                    description
                } = req.body; 

                const newEducation = {
                    school,
                    degree,
                    fieldofstudy,
                    from,
                    to,
                    current,
                    description
                }
                // add at the beginning of the array
                profile.education.unshift(newEducation);
                

                await profile.save();
                console.log('education added...');
                res.json(profile);
            }
            
        } catch (error) {
            console.error(error.message);
            res.status(500).json({msg: 'Server error'});
        }
    } 
);

// @route delete api/profile/education
// @desc  delete education
// @access private
router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile = await profileSchema.findOne({user: req.user.id});
        if(profile){
            // const removedIdx = await profile.experience.map(item => item.)
            const removingIdx = profile.education.findIndex(item=> item.id === req.params.edu_id);
             console.log(`index found ${removingIdx}`);

        
            if(removingIdx!=-1){
                profile.education.splice(removingIdx);
            }

            res.json(profile);
            await profile.save();
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({msg: 'Server error'});
    }
    
    }
);
// @route get api/profile/github.:username
// @desc  get user repo from github
// @access public
router.get('/github/:username', (req, res) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
            method: 'GET',
            headers: { 'user-agent':'node.js'}
        }

        request(options, (err, response, body) => {
            if(err){
                console.error(err);
                return res.status(404).json({msg: err.message});
            }
            console.log(response.status);
            if(response.statusCode!==200){
                return res.status(404).json({ msg: 'No github profile found'});
            }

            res.json(JSON.parse(body));
        })
    } catch (error) {
        console.error(error.message);
        res.status(500).json({msg: 'Server error'});
        
    }
})
module.exports = router;