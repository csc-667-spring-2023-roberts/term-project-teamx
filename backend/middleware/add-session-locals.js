const addSessionLocals = (request, _response, next) => {
  if (request.session.user !== undefined) {
    request.app.locals.user = {
      ...request.session.user,
    };
  }

  next();
};

module.exports = addSessionLocals;
