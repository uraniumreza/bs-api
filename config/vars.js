module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'bst',
  jwtExpirationInterval: process.env.JWT_EXPIRATION_MINUTES || 43200,
};
