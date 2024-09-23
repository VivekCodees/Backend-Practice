/*
This function is used to simplify error handling for asynchronous request handlers in Express.js. Normally, you would need to manually handle try-catch blocks for errors in asynchronous code. With asyncHandler, you can just wrap the function and any errors will be automatically caught and passed to the error middleware.
*/
const asyncHandler = (requestHandler) => {
  (req, res, next) => {
  return (req, res, next) => {
      Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
  }
}
}
export { asyncHandler }

// const asyncHandler = () => {}
// const asyncHandler = (function) => { () =>{} };
// const asyncHandler = (function) => async () =>{} ;

// Try catch code
/*
const asyncHandler = (fn) => async (req,res,next) => {
    try {
        await fn(req,res,next)
    } catch (error) {
        res.status(error.code || 500).json({
            success: false,
            message: error.message
        })
    }
};
*/
