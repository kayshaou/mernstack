const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const UserSchema = require('../../models/User');
const PostSchema = require('../../models/Post');
const auth = require('../../middleware/auth');
// @route POST api/posts
// @desc create a post
// @access private
router.post('/', [
    auth,
    [
        check('text', 'Text is required').not().isEmpty()
    ]
], async (req, res) => {
    // res.send('Posts routes');
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array()});
        }


        console.log(`req.user.id ${req.user.id}`);
        const userModel = await UserSchema.findById(req.user.id).select('-password');

        if(userModel){

        const newPost = new PostSchema({
            text: req.body.text,
            name: userModel.name,
            avatar: userModel.avatar,
            user: req.user.id
        })

        await newPost.save(); 
        res.json(newPost);
        }

        
    } catch (error) {
        console.error(error.message);
        res.status(500).json({msg: 'Server error'});
    }
    
})
// @route GET api/posts
// @desc GET all posts
// @access private
router.get('/', auth, async (req, res) => {
    try {
        const posts = await PostSchema.find().sort({date: -1});
        if(posts){
            return res.json(posts);
        }

        res.json({msg: 'No posts found'});
    } catch (error) {
        console.error(error.message);
        res.status(500).json({msg: 'Server error'});
    }

})


// @route GET api/posts/:id
// @desc GET post by ID
// @access private
router.get('/:id', async (req, res) => {
    try {
        const post = await PostSchema.findById(req.params.id);
        if(post){
            return res.json(post);
        }

        res.status(404).json({msg: 'No posts found'});
    } catch (error) {
        console.error(error.message);
        if(error.kind==='ObjectId'){
            return res.status(404).json({msg: 'No posts found'});
        }
        res.status(500).json({msg: 'Server error'});
    }

})

// @route DELETE api/posts/:id
// @desc delete post by id
// @access private
router.delete('/:id', auth, async (req, res) => {
    try {
        const posts = await PostSchema.findById(req.params.id).populate('user', ['id','name','avatar'])
       
        if(posts && (posts.user._id.toString()===req.user.id)){
            await posts.remove();
            res.json({msg: 'Post deleted'});
        }
        else{
            res.json({msg: 'Not allowed'});
        }
        
    } catch (error) {
        console.error(error.message);
        if(error.kind==='ObjectId'){
            return res.status(404).json({msg: 'No posts found'});
        }
        res.status(500).json({msg: 'Server error'});
    }

})

// @route put api/posts/like/:id
// @desc like a post
// @access private
router.put('/like/:id', 
    auth, 
    async (req, res) => {
    try {
        const postModel = await PostSchema.findById(req.params.id);
        // if post is found..


        if(postModel){
            // make sure can only like once // there can be many likes per post
            console.log(req.user.id);
            const postFiltered = postModel.likes.filter(like => like.user.toString()===req.user.id);
       
            if(postFiltered.length===0){
                
                postModel.likes.unshift({ user: req.user.id});
                console.log('post will now have like '+postModel);
                await postModel.save();
                res.json(postModel);
            } else {
                res.status(400).json({msg: 'You have already liked this post' });
            }

            
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({msg: 'Server Error'});
    }
})

// @route put api/posts/unlike/:id
// @desc unlike a post
// @access private
router.put('/unlike/:id', 
    auth, 
    async (req, res) => {
    try {
        const postModel = await PostSchema.findById(req.params.id);
        // if post is found..


        if(postModel){
            // make sure can only like once // there can be many likes per post
            const postFiltered = postModel.likes.filter(like => like.user.toString()===req.user.id);
            // can't unlike the post that have yet been liked
            // if found to have already liked
            if(postFiltered.length>0){
                const newLikes = {
                    user: req.user.id
                }
                postModel.likes.shift({user: req.user.id});
                console.log('post will now have like '+postModel);
                await postModel.save();
                res.json(postModel);
            } else {
                res.status(400).json({msg: 'Can\'t unlike the post that have not been liked' });
            }

            
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({msg: 'Server Error'});
    }
})

// @route POST api/posts/comment/:id
// @desc Comment a post
// @access private
router.post('/comment/:id', [
    auth,
    [
        check('text', 'Text is required').not().isEmpty()
    ]
], async (req, res) => {
    // res.send('Posts routes');
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array()});
        }


        console.log(`req.user.id ${req.user.id}`);
       
        const user = await UserSchema.findById(req.user.id);
        const post = await PostSchema.findById(req.params.id);
        if(post){
            const newComment = {
                user: req.user.id,
                text: req.body.text,
                avatar: user.avatar
            }
            // add comment in front
            post.comments.unshift(newComment);
            await post.save();
            res.json(post);
        }

        
        
        
    } catch (error) {
        console.error(error.message);
        res.status(500).json({msg: 'Server error'});
    }
    
});
// @route delete api/posts/comment/:id/:comment_id
// @desc delete comment
// @access private
router.delete('/comment/:id/:comment_id', auth, async (req, res)=>{
    try {
        // find post where u want the comment to be deleted at 
        const post = await PostSchema.findById(req.params.id);
        // check if there's the post and 

        for (const [index, element] of post.comments.entries())
            console.log(index, element._id);

        const comment = post.comments.find(comment => comment._id.toString()===req.params.comment_id);


        console.log('found comment '+comment);
        if(comment && (comment.user.toString()===req.user.id)){
            const commentsIdx = post.comments.findIndex(comment => comment._id.toString()===req.params.comment_id);
            console.log('deleting idx '+commentsIdx);
            post.comments.splice(commentsIdx,1);
            console.log('comment deleted');
            // to save into db
            await post.save();
        } else{
            return res.status(404).json({msg : 'can\'t delete this comment'});
        }

        res.json(post);
        
        
    } catch (error) {
        console.error(error.message);
        res.status(500).json({msg: 'Server error'});
    }
})
module.exports = router;