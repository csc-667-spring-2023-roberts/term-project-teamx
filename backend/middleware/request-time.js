const requestTime = (request, response, next) => {
  console.log(`Request recieved at ${Date.now()}: ${request.method}`);
  next();
};

export default requestTime;
