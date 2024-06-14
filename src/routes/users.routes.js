/**
 * @author Divyesh Baraiya
 * @description Routing to Controller for Incoming Request for /user/v1
 */

const userRoute = require('express').Router({ caseSensitive: false });

// -- Config
userRoute.use('/account', require('express').static('src/public/verification-pages'))

// -- Controllers --
const { usersControllers: controller } = require('../controllers');


// -- Middleware --
const { userAuthenticationMiddleware } = require('../middleware')

// -- Routes --

// Account
userRoute.post('/account/mobile-verification', controller.verification.mobileVerification);
userRoute.post('/account/authorization', controller.authorizationUserController.createLoginUser); // MOBILE OR EMAIL OTP 
userRoute.post('/account/authorization/verify', controller.authorizationUserController.verifyUser); // MOBILE OR EMAIL OTP Verify 

// * Middleware
userRoute.use(userAuthenticationMiddleware);

// -- Authorized Routes --

// Account
userRoute.get('/account/profile', controller.getProfileController);
userRoute.post('/account/update-profile', controller.updateProfileController)

module.exports = userRoute;