import { body, validationResult } from 'express-validator';
import { sendError } from '../helpers/responseHelper.js';

export const validateResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'Validation Error', errors.array());
  }
  next();
};

export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').optional().isIn(['donor', 'volunteer', 'ngo', 'admin']).withMessage('Invalid role specified'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  validateResult
];

export const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validateResult
];
