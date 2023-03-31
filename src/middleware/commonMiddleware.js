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

