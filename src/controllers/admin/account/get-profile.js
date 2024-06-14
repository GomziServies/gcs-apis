/**
 * @author  Divyesh Baraiya
 * @description Get All Admin Information
 */

const getAdminUserController = require('../admin-user/get-admin');

module.exports = async (req, res) => {
    req.logger.info('Controller > Admin > Account > Get Profile');

    let { adminAuthData } = req.headers

    req.query.adminID = adminAuthData.id
    return getAdminUserController(req, res)
}