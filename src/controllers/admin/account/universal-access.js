/**
 * @author Smit Luvani, Jenil Narola
 * @description Login into Admin Account and Get Authorization Token
 */
const httpStatus = require('http-status'),
    { AdminRepo } = require('../../../database'),
    { winston: logger } = require('../../../services'),
    response = require('../../../utils/response');
const unirest = require('unirest');

module.exports = async (req, res) => {
    req.logger.info('Controller > Admin > Account > Universal Access');

    const { adminAuthData } = req.headers;
    try {
        let adminAccount = await AdminRepo.findOne({ _id: adminAuthData.id });

        let accounts_access = [{
            platform: 'fg_group',
            access: req.headers.authorization
        }];

        let availablePlatforms = [{
            platform: 'fwg',
            email: adminAccount.email
        }]

        for (let platformAccount of availablePlatforms) {
            switch (platformAccount.platform) {
                case 'fwg':
                    let token = await requestFWGAccess(platformAccount.email);
                    if (token) {
                        accounts_access.push({
                            platform: platformAccount.platform,
                            access: token
                        });
                    }
                    break;
                default:
                    break;
            }
        }

        return response(res, httpStatus.OK, 'Accounts access granted', accounts_access)
    } catch (error) {
        return response(res, httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Something went wrong', error)
    }
}

async function requestFWGAccess(email) {
    // Request access to FWG API

    let res = await unirest
        .get(`${process.env.FWG_API_URL}/universal-access/${email}`)
        .then(response => response.body)
        .catch(error => {
            logger.error('CRONJOB: [Online Course Reminder Email]: ' + error.message)
        })
    if (!res) return null;
    return res.data?.authorization;
}