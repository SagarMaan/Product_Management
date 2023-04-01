const userModel = require("../models/userModel")
const { isValidObjectId } = require("mongoose")
const jwt = require("jsonwebtoken")


//========================================== Authentication ==================================================//


const isAuthenticated = async function ( req , res , next ) {
    try{
        let token = req.headers.authorization

        if( !token ){
            return res.status(400).send({ status : false , message : "Token must be present in the bearer."})
        }
        token = token.slice(7)
        
        jwt.verify( token , "group-13-project" , function ( error , decodedToken ) {
            if ( error) {
                if ( error.name === "JsonWebTokenError" ) {
                    return res.status(401).send({ status : false , message : "Invalid token."})
                }

                if ( error.name === "TokenExpiredError") {
                    return res. status(401).send({ status : false , message : "You are logged out login again."})
                }else {
                    return res.status(401).send({ status : false , message : error.message})
                }
            }else{
                req.token = decodedToken
                next()
            }
        })

    }catch( error ){
        return res.status(500).send({ status : false , message : error.message})
    }
}


//================================ Autherisation ===========================//


const isAuthorized = async function ( req , res , next ) {
    try{
        let loggedUserId = req.token.userId

        if( req.originalUrl === "/user" ) {
            let userId = req.body.userId

            if( userId && typeof userId != "string" ) {
                return res.status(400).send({ status : false , message : "UserId must be in string."})
            }
            if( !userId || !userId.trim() ) {
                return res.status(400).send({ status : false , message : "User Id must be present for Authorization."})
            }
            userId = userId.trim()

            if( !isValidObjectId(userId) ) {
                return res.status(400).send({ status : false , message : "Invalid UserId."})
            }

            const userData = await userModel.findById(userId)
            if( !userData ) {
                return res.status(404).send({ status : false , message : "The user Id does not exist."})
            }

            if( loggedUserId != userId ) {
                return res.status(403).send({ status : false , message : "You are not authorized,please provide valid user id."})
            }
             req.body.userId = userId
        }else {
            
            let userId = req.params.userId;

            if ( !userId ) {
                return res.status(400).send({ status: false, message: "User id is mandatory" });
            }
            if ( !isValidObjectId(userId )) {
                return res.status(400).send({ status: false, message: "Invalid user ID" });
            }

            let checkuserId = await userModel.findById(userId);
            if ( !checkuserId ) {
                return res.status(404).send({ status: false, message: "Data Not found with this user id, Please enter a valid user id" });
            }

            let authenticatedUserId = checkuserId._id;
            
            if ( authenticatedUserId != loggedUserId ) {
                return res.status(403).send({ status: false, message: "Not authorized,please provide your own user id" });
            }
        }
        next();

    }catch( error ){
        return res.status(500).send({ status : false , message : error.message})
    }
}



module.exports = { isAuthenticated, isAuthorized };