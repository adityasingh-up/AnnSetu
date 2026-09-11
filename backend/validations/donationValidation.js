import { body } from 'express-validator';
import { validateResult } from './authValidation.js';

export const createDonationValidation = [
  body('title').trim().notEmpty().withMessage('Donation title is required'),
  body('foodCategory')
    .isIn(['cooked_meal', 'raw_ingredients', 'packaged_food', 'bakery_fruits', 'beverages'])
    .withMessage('Invalid food category'),
  body('foodType').optional().isIn(['veg', 'non-veg', 'vegan', 'jain']).withMessage('Invalid food type'),
  body('quantityKg').isFloat({ min: 0.5 }).withMessage('Quantity must be at least 0.5 Kg'),
  validateResult
];
