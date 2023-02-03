const StatusPost = require("../model/statusPost.model")
const LikePost = require("../model/likePost.model")
const Comment = require("../model/comment.model")

const jwt = require("jsonwebtoken");
const User = require("../model/user.model");

exports.getAllSharePosts = async (req, res, next) => {
    const tokenStr = req.headers.cookie
    const token = tokenStr.slice(6)
    const decoded = jwt.verify(token, "secret");
    req.jwtPayload = decoded;

    try {
        const [allSharePosts] = await StatusPost.fetchAllSharePost()
        const [allLikedPosts] = await LikePost.fetchAllLikePosts()
        const [allComments] = await Comment.fetchAllComments()
        const [allUsersInfo] = await User.fetchAllUserInfo()
        const usersLikedPosts = allLikedPosts.filter(item => item.likePost_user_id === req.jwtPayload.user_id)

        allSharePosts.map(async (item) => {
            item.comment = []
            allComments.forEach(comment => {
                if(item.post_id === comment.comment_post_id){
                    item.comment.push(comment)
                }        
                allUsersInfo.forEach(user => {
                    if(user.user_id === comment.comment_user_id){
                        comment.username = user.username
                    }
                })
                const commentDate = new Date(comment.comment_date)
                comment.comment_date = commentDate.toLocaleDateString()
            })

            const postDate = new Date(item.post_create_date)
            item.post_create_date = postDate.toLocaleDateString()

            usersLikedPosts.forEach(likedPost => {
                if(item.post_id === likedPost.likePost_post_id){
                    return item.likeStatus = true
                }
            })
            if (!(item.likeStatus)) {
                return item.likeStatus = false;                            
            }
            
        })

        allSharePosts.forEach(e => {
            console.log(e.comment);
        })
        // console.log(allSharePosts);
        res.render('sharePage', {allSharePosts, usersLikedPosts, loginUserId: req.jwtPayload.user_id})
   
    } catch (error) {
        console.error(error.message)
        res.render('error', {message: "Something wrong in server.", btnMessage: "Back to my page", url: "/home/mypage"})

    }
}

exports.postShareStatus = (req, res, next) => {
    const tokenStr = req.headers.cookie
    const token = tokenStr.slice(6)
    const decoded = jwt.verify(token, "secret");
    req.jwtPayload = decoded;

    const today = new Date()

    const reqObj = req.body
    reqObj.post_user_id = req.jwtPayload.user_id
    reqObj.post_create_date = today
    
    const newPost = new StatusPost(...Object.values(reqObj))

    newPost.save()
        .then(() => {
            return res.redirect('/sharepage')
        })
        .catch((err) => {
            console.error(err.message)
            res.render('error', {message: "Something wrong in server.", btnMessage: "Back to my page", url: "/home/mypage"})
        })
}


exports.updateShareStatus = (req, res, next) => {
    console.log("UPDATE");
    const tokenStr = req.headers.cookie
    const token = tokenStr.slice(6)
    const decoded = jwt.verify(token, "secret");
    req.jwtPayload = decoded;

    const updatedObj = req.body
    updatedObj.post_user_id = String(req.jwtPayload.user_id)
    updatedObj.post_id = req.params.postId
    console.log(updatedObj);

    StatusPost.updateSharePost(updatedObj)
        .then(() => {
            return res.redirect('/sharepage')
        })
        .catch((err) => {
            console.error(err.message)
            res.render('error', {message: "Something wrong in server.", btnMessage: "Back to my page", url: "/home/mypage"})
        })
}

exports.deleteSharePost = (req, res, next) => {
    const tokenStr = req.headers.cookie
    const token = tokenStr.slice(6)
    const decoded = jwt.verify(token, "secret");
    req.jwtPayload = decoded;

    StatusPost.deleteSharePost(req.params.postId, req.jwtPayload.user_id)
        .then(() => {
            return res.redirect('/sharepage')
        })
        .catch((err) => {
            console.error(err.message)
            res.render('error', {message: "Something wrong in server.", btnMessage: "Back to share page", url: "/sharepage"})
        }) 
}

exports.postComment = (req, res, next) => {
    const tokenStr = req.headers.cookie
    const token = tokenStr.slice(6)
    const decoded = jwt.verify(token, "secret");
    req.jwtPayload = decoded;

    const today = new Date()

    const reqBody = req.body
    reqBody.comment_user_id = req.jwtPayload.user_id
    reqBody.comment_date = today

    const newComment = new Comment(...Object.values(reqBody))
    newComment.save()
        .then(() => res.redirect('/sharepage'))
        .catch((err) => {
            console.error(err.message)
            res.render('error', {message: "Something wrong in server.", btnMessage: "Back to share page", url: "/sharepage"})
        })
}

