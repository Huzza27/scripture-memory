const { validationResult } = require('express-validator');

/**
 * Runs express-validator checks and short-circuits with 400 if any fail.
 * Usage: router.post('/route', [...rules], validate, handler)
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: errors.array()[0].msg,
        fields: errors.array().map(e => ({ field: e.path, message: e.msg })),
      },
    });
  }
  next();
}

module.exports = { validate };
