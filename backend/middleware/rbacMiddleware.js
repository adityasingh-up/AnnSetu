import { sendError } from '../helpers/responseHelper.js';

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'User not authenticated.');
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `User role '${req.user.role}' is not authorized to access this resource. Required: [${roles.join(', ')}]`
      );
    }

    next();
  };
};
