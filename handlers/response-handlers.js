const errorHandler = (err, res, cb) => {
  if (err) {
    return res.json(err);
  }
  return cb();
}

const successHandler = (req, data, next) => {
  req.data = data;
  return next();
}

module.exports = {
	errorHandler,
	successHandler
};