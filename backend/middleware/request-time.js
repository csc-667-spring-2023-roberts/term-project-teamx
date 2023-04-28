const requestTime = (request, _response, next) => {
  console.log(`Request received at ${Date.now()}: ${request.method}`);
  next();
};

export default requestTime;
