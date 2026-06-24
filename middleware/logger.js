/**
 * Request Logging Middleware
 * Logs incoming HTTP request details, response status, and processing duration.
 */
const logger = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;
  
  // Hook into response finish event
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    console.log(`[API LOG] ${new Date().toISOString()} | ${method} ${originalUrl} | Status: ${statusCode} | Time: ${duration}ms | IP: ${ip}`);
  });

  next();
};

module.exports = logger;
