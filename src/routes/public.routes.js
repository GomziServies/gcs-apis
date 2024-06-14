/**
 * @author Divyesh Baraiya
 * @description Routing to Controller for Incoming Request for /user/v1
 */

const publicRoutes = require('express').Router({ caseSensitive: false });

// -- Controllers --
const { publicControllers: controller } = require('../controllers');

// -- Routes --

// Contact Form
publicRoutes.post('/contact-inquiry', controller.contactUsController);

module.exports = publicRoutes;