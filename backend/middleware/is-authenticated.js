const isAuthenticated = (request, response, next) => {
  const { user } = request.session;

  if (user !== undefined && user.id !== undefined) {
    next();
  } else {
    response.redirect("/authentication/login");
  }
};

module.exports = isAuthenticated;
