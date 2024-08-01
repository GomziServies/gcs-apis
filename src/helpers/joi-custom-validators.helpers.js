const { isValidObjectId } = require("mongoose");

module.exports.JoiObjectIdValidator = function (value, helpers) {
    if (isValidObjectId(value)) {
        return value
    } else {
        return helpers.error("string.objectId");
    }
}