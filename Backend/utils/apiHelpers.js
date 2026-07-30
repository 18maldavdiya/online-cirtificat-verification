const mongoose = require("mongoose");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const getPagination = (query) => {
    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(query.limit, 10) || 10, 1);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

const paginate = async (Model, filter, { skip, limit }, sort = { createdAt: -1 }) => {
    const [items, total] = await Promise.all([
        Model.find(filter).sort(sort).skip(skip).limit(limit),
        Model.countDocuments(filter),
    ]);

    return { items, total, pages: Math.max(Math.ceil(total / limit), 1) };
};

const buildSearchQuery = (search, fields) => {
    if (!search) {
        return null;
    }

    const regex = new RegExp(search, "i");
    return { $or: fields.map((field) => ({ [field]: regex })) };
};

const validateEnum = (value, allowedValues, fieldLabel) => {
    if (value === undefined || value === null) {
        return null;
    }

    if (!allowedValues.includes(value)) {
        return `${fieldLabel} must be one of: ${allowedValues.join(", ")}`;
    }

    return null;
};

const handleWriteError = (res, error, { duplicateMessage, serverMessage }) => {
    if (error && error.code === 11000) {
        return res.status(409).json({
            success: false,
            message: duplicateMessage,
        });
    }

    return res.status(500).json({
        success: false,
        message: serverMessage,
        error: error.message,
    });
};

module.exports = {
    isValidId,
    getPagination,
    paginate,
    buildSearchQuery,
    validateEnum,
    handleWriteError,
};
