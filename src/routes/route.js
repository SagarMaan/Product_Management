const router = require("express").Router();
const { register,  getUsers, userLogin, updateUser } = require("../controllers/userController");
const { createProduct , getProductById, getProducts,updateProduct,deleteProduct } = require("../controllers/productController")
const { createCart , getCart , updateCart , deleteCart } = require("../controllers/cartController")
const { createOrder , updateOrder } = require("../controllers/orderController") 
const { isAuthenticated, isAuthorized } = require("../middleware/commonMiddleware")


// ===================================== User API's ====================================== //


router.post( "/register" , register );
router.post( "/login" , userLogin );
router.get( "/user/:userId/profile" , isAuthenticated , getUsers );
router.put( "/user/:userId/profile" , isAuthenticated , isAuthorized , updateUser );


// ===================================== Product API's ====================================== //


router.post( "/products" , createProduct );
router.get( "/products/:productId" , getProductById );
router.get( "/products" , getProducts );
router.put( "/products/:productId" , updateProduct )
router.delete( "/products/:productId" , deleteProduct )


// ===================================== Cart API's ====================================== //


router.post( "/users/:userId/cart" , isAuthenticated , isAuthorized , createCart );
router.get( "/users/:userId/cart" , isAuthenticated , isAuthorized , getCart );
router.put( "/users/:userId/cart" , isAuthenticated , isAuthorized , updateCart );
router.delete( "/users/:userId/cart" , isAuthenticated , isAuthorized , deleteCart );


// ===================================== Order API's ====================================== //


router.post( "/users/:userId/orders", isAuthenticated , isAuthorized , createOrder );
router.put( "/users/:userId/orders" , isAuthenticated , isAuthorized , updateOrder );


// ===================================== Invalid path ====================================== //


router.all('/*', ( req , res ) => {
    res.status(400).send({ status: false, message: " Path invalid." });
});


module.exports=router