import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Validation middleware to check for validation errors
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
  }
  next();
};

// Common validation rules
export const userValidationRules = () => [
  body('email').isEmail().normalizeEmail().withMessage('Must be a valid email'),
  body('username')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('firstName').optional().isLength({ max: 50 }).withMessage('First name must be less than 50 characters'),
  body('lastName').optional().isLength({ max: 50 }).withMessage('Last name must be less than 50 characters'),
];

export const dashboardValidationRules = () => [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('Dashboard name is required and must be less than 100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('layout').optional().isObject().withMessage('Layout must be an object'),
];

export const chartValidationRules = () => [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('Chart title is required and must be less than 100 characters'),
  body('type')
    .isIn(['line', 'bar', 'pie', 'area', 'scatter', 'kpi']).withMessage('Invalid chart type'),
  body('config').isObject().withMessage('Config must be an object'),
  body('datasetId').isUUID().withMessage('Valid dataset ID is required'),
];

export const datasetValidationRules = () => [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('Dataset name is required and must be less than 100 characters'),
  body('type')
    .isIn(['csv', 'excel', 'json']).withMessage('Dataset type must be csv, excel, or json'),
  body('uploadedData').isObject().withMessage('Uploaded data must be an object'),
];

export const aiConfigValidationRules = () => [
  body('providerId').isUUID().withMessage('Valid provider ID is required'),
  body('apiKey').trim().isLength({ min: 1 }).withMessage('API key is required'),
  body('model').optional().trim().isLength({ max: 100 }).withMessage('Model name must be less than 100 characters'),
  body('settings').optional().isObject().withMessage('Settings must be an object'),
];

export const emailReportValidationRules = () => [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('Report name is required and must be less than 100 characters'),
  body('recipients').isArray().withMessage('Recipients must be an array'),
  body('recipients.*').isEmail().withMessage('Each recipient must be a valid email'),
  body('schedule').isLength({ min: 1 }).withMessage('Schedule is required'),
  body('format').isIn(['pdf', 'excel', 'png']).withMessage('Format must be pdf, excel, or png'),
];

// Validation for customer ID in params
export const customerIdValidationRules = () => [
  param('customerId').isUUID().withMessage('Valid customer ID is required')
];

// Validation for user ID in params
export const userIdValidationRules = () => [
  param('id').isUUID().withMessage('Valid user ID is required')
];

// Validation for dashboard ID in params
export const dashboardIdValidationRules = () => [
  param('id').isUUID().withMessage('Valid dashboard ID is required')
];

// Validation for chart ID in params
export const chartIdValidationRules = () => [
  param('id').isUUID().withMessage('Valid chart ID is required')
];

// Validation for dataset ID in params
export const datasetIdValidationRules = () => [
  param('id').isString().withMessage('Valid dataset ID is required')
];

// Validation for data source ID in params
export const dataSourceIdValidationRules = () => [
  param('id').isUUID().withMessage('Valid data source ID is required')
];