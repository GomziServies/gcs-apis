/**
 * @author Smit Luvani
 * @description Get User Orders
 */

const httpStatus = require('http-status')
const response = require('../../../utils/response')
const { nodeCache } = require('../../../services')
const {
    OrdersRepo,
    UserRepo,
    FitnessCourseRepo,
    UserFitnessCourseRepo,
    FitnessPlanRepo,
    UserFitnessPlanRepo,
    DigitalPlansRepo,
    UserDigitalPlansRepo,
    BooksRepo,
    UserBooksRepo,
    ProductsRepo,
    UserMealProductRepo,
    EBookRepo,
    UserEBooksRepo
} = require('../../../database');
const { userStatus, itemType, orderStatus } = require('../../../common');
const { isValidObjectId } = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const moment = require('moment');
const { isString } = require('lodash');
const { PaginationHelper, MongoDBQueryBuilder } = require('../../../helpers');

module.exports = async (req, res) => {
    req.logger.info('Controller > Admin > Orders > Get Orders')

    const _metadata = {
        item_type: Object.values(itemType),
        order_status: Object.values(orderStatus)
    }

    try {

        let { order_id, receipt_id, item_type, user_id, order_status, from_date, to_date } = req.query
        Object.assign(req.query, { maxLimit: 100 })

        const cacheKey = GetOrderPrefix + JSON.stringify(req.query), cacheTTL = 60;
        const cacheMetadataKey = cacheKey + '/metadata'

        if (GeneralCache.has(cacheKey) && GeneralCache.has(cacheMetadataKey)) {
            let metadata = GeneralCache.get(cacheMetadataKey);
            Object.assign(metadata, { fromCache: 'General', cachePrefix: GetOrderPrefix })
            return response(res, httpStatus.OK, 'success', GeneralCache.get(cacheKey), undefined, metadata);
        }

        // Validate Order ID
        if (order_id && !isValidObjectId(order_id)) {
            return response(res, httpStatus.BAD_REQUEST, 'Invalid Order ID')
        }

        item_type = isString(item_type) ? item_type.split(',') : null
        order_status = isString(order_status) ? order_status.split(',') : null

        // Validate User ID
        if (user_id && !isValidObjectId(user_id)) {
            return response(res, httpStatus.BAD_REQUEST, 'Invalid User ID')
        }

        let findQuery = {}

        order_id ? findQuery._id = new ObjectId(order_id) : null
        receipt_id ? findQuery.receipt_id = receipt_id : null
        item_type ? findQuery.order_item_type = { $in: item_type } : null
        user_id ? findQuery.user_id = new ObjectId(user_id) : null
        order_status ? findQuery.status = { $in: order_status } : null

        if (from_date) {
            if (new Date(from_date) == 'Invalid Date') {
                return response(res, httpStatus.BAD_REQUEST, 'Invalid From Date')
            }

            findQuery.createdAt = { $gte: moment(new Date(from_date)).startOf('day').toDate() }
        }

        if (to_date) {
            if (new Date(to_date) == 'Invalid Date') {
                return response(res, httpStatus.BAD_REQUEST, 'Invalid To Date')
            }

            if (findQuery.createdAt) {
                findQuery.createdAt.$lte = moment(new Date(to_date)).endOf('day').toDate()
            } else {
                findQuery.createdAt = { $lte: moment(new Date(to_date)).endOf('day').toDate() }
            }
        }

        var orderProjection = {
            createdBy: false,
            user_type: false,
            gateway_signature: false,
            updatedBy: false,
        }

        const pagination = PaginationHelper.getPagination(req.query, { maxLimit: req.query.maxLimit });
        const CountDocs = await OrdersRepo.countDocuments(findQuery);
        const PaginationInfo = PaginationHelper.getPaginationInfo(CountDocs, req.query);
        const SortQuery = MongoDBQueryBuilder.sortQuery(req.query.sort, req.query.sortOrder)

        var orderResult = await OrdersRepo.find(findQuery, orderProjection, { lean: true })

        var orderResult = await OrdersRepo
            .find(findQuery)
            .select(orderProjection)
            .skip(pagination.skip)
            .limit(pagination.limit)
            .sort(SortQuery)
            .lean()

        const [findUser, findFitnessCourse, findUserFitnessCourse, findFitnessPlan, findUserFitnessPlan, findBook, findUserBook, findEBook, findUserEBook, findDigitalPlan, findUserDigitalPlan, findProduct, findMealProduct,] = await Promise.all([
            // User [findUser]
            UserRepo.find({ _id: { $in: [...new Set(orderResult.map(order => order.user_id))] }, status: userStatus.active }, { country_code: true, email: true, emailVerified: true, first_name: true, last_name: true, uid: true, mobile: true, mobileVerified: true, status: true, }, { lean: true }).then(items => items.map(item => ({ ...item, _id: item._id.toString() }))),

            // Fitness Course [findFitnessCourse, findUserFitnessCourse]
            FitnessCourseRepo.find({ _id: { $in: orderResult.filter(order => order.order_item_type == itemType.fitness_course).map(order => order.order_item_id) } }, { course_name: true, coaching_mode: true, amount: true, course_category: true, duration_days: true, status: true, currency: true }, { lean: true }).then(items => items.map(item => ({ ...item, _id: item._id.toString() }))),
            UserFitnessCourseRepo.find({ order_id: { $in: orderResult.filter(order => order.order_item_type == itemType.fitness_course).map(order => order._id) } }, { duration: true, start_date: true, end_date: true, order_id: true }, { lean: true }).then(items => items.map(item => ({ ...item, order_id: item.order_id.toString() }))),

            // Fitness Plan [findFitnessPlan, findUserFitnessPlan]
            FitnessPlanRepo.find({ _id: { $in: orderResult.filter(order => order.order_item_type == itemType.pt_plan).map(order => order.order_item_id) } }, { plan_name: true, duration: true, amount: true }, { lean: true }).then(items => items.map(item => ({ ...item, _id: item._id.toString() }))),
            UserFitnessPlanRepo.find({ order_id: { $in: orderResult.filter(order => order.order_item_type == itemType.pt_plan).map(order => order._id) } }, { duration: true, start_date: true, end_date: true, order_id: true }, { lean: true }).then(items => items.map(item => ({ ...item, order_id: item.order_id.toString() }))),

            // Books [findBook, findUserBook]
            BooksRepo.find({ _id: { $in: orderResult.filter(order => order.order_item_type == itemType.books).map(order => order.order_item_id) } }, { book_title: true, amount: true }, { lean: true }).then(items => items.map(item => ({ ...item, _id: item._id.toString() }))),
            UserBooksRepo.find({ order_id: { $in: orderResult.filter(order => order.order_item_type == itemType.books).map(order => order._id) } }, undefined, { lean: true }).then(items => items.map(item => ({ ...item, order_id: item.order_id.toString() }))),

            // E-books [findEBook, findUserEBook]
            EBookRepo.find({ _id: { $in: orderResult.filter(order => order.order_item_type == itemType.ebooks).map(order => order.order_item_id) } }, { ebook_title: true, amount: true }, { lean: true }).then(items => items.map(item => ({ ...item, _id: item._id.toString() }))),
            UserEBooksRepo.find({ order_id: { $in: orderResult.filter(order => order.order_item_type == itemType.ebooks).map(order => order._id) } }, undefined, { lean: true }).then(items => items.map(item => ({ ...item, order_id: item.order_id.toString() }))),

            // Digital Plans [findDigitalPlan, findUserDigitalPlan]
            DigitalPlansRepo.find({ _id: { $in: orderResult.filter(order => order.order_item_type == itemType.digital_plan).map(order => order.order_item_id) } }, { plan_name: true, duration_days: true, amount: true }, { lean: true }).then(items => items.map(item => ({ ...item, _id: item._id.toString() }))),
            UserDigitalPlansRepo.find({ order_id: { $in: orderResult.filter(order => order.order_item_type == itemType.digital_plan).map(order => order._id) } }, undefined, { lean: true }).then(items => items.map(item => ({ ...item, order_id: item.order_id.toString() }))),

            // FG Meals Product [findProduct, findMealProduct]
            ProductsRepo.find({ _id: { $in: orderResult.filter(order => order.order_item_type == itemType.meals).map(order => order.order_item_id) } }, { name: true, price: true, display_image: true }, { lean: true }).then(items => items.map(item => ({ ...item, _id: item._id.toString() }))),
            UserMealProductRepo.find({ order_id: { $in: orderResult.filter(order => order.order_item_type == itemType.meals).map(order => order._id) } }, undefined, { lean: true }).then(items => items.map(item => ({ ...item, order_id: item.order_id.toString() }))),
        ])

        orderResult = orderResult.map(order => {
            var userID = String(order.user_id), orderID = String(order._id), orderItemID = String(order.order_item_id)

            order.user_info = findUser.find(user => user._id === userID)

            if (order.order_item_type == itemType.fitness_course) {
                order.fitness_course = findFitnessCourse.find(item => item._id == orderItemID)
                order.fitness_course_subscription = findUserFitnessCourse.find(item => item.order_id == orderID)
            } else if (order.order_item_type == itemType.pt_plan) {
                order.fitness_plan = findFitnessPlan.find(item => item._id == orderItemID)
                order.fitness_plan_subscription = findUserFitnessPlan.find(item => item.order_id == orderID)
            } else if (order.order_item_type == itemType.books) {
                order.book = findBook.find(book => String(book._id) == orderItemID)
                order.book_subscription = findUserBook.find(item => item.order_id == orderID)
            } else if (order.order_item_type == itemType.ebooks) {
                order.ebook = findEBook.find(item => item._id == orderItemID)
                order.ebook_purchase_info = findUserEBook.find(item => item.order_id == orderID)
            } else if (order.order_item_type == itemType.digital_plan) {
                order.digital_plan = findDigitalPlan.find(item => item._id == orderItemID)
                order.digital_plan_subscription = findUserDigitalPlan.find(item => item.order_id == orderID)
            } else if (order.order_item_type == itemType.meals) {
                order.product = findProduct.find(item => item._id == orderItemID)
                order.meal_product = findMealProduct.find(item => item.order_id == orderID)
            }

            return order;
        })

        Object.assign(_metadata, { pagination: PaginationInfo })
        GeneralCache.set(cacheKey, orderResult, cacheTTL)
        GeneralCache.set(cacheMetadataKey, _metadata, cacheTTL)
        return response(res, httpStatus.OK, 'success', orderResult, undefined, _metadata)

    } catch (error) {
        return response(res, httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Something went wrong', error)
    }
}