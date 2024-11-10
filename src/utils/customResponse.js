
/**
 * Custom response utility to handle various types of API responses.
 *
 * @param {Object} params - Object containing response details.
 * @param {string} [params.message='Success'] - Optional message for JSON responses.
 * @param {any} [params.data=null] - Optional data for JSON responses.
 * @param {number} [params.status=200] - HTTP status code for the response.
 * @param {Object} [params.headers={}] - Optional headers to be set in the response.
 * @param {Buffer|Uint8Array|string} [params.content] - Content for the response (binary or text).
 * @param {Object[]} [params.cookiesData=[]] - Optional array of cookies to be set in the response.
 * @param {string} [params.contentType='application/json'] - Content type of the response (e.g., 'application/json', 'image/png', 'video/mp4'). 
 * @returns {Response} - A standardized Node.js response object.
 */
function customResponse({
  message = "Success",
  data = null,
  status = 200,
  cookiesData = [],
  headers = {},
  content,
  contentType = "application/json",
}, res) {
  try {
    // Set cookies if cookiesData is provided
    cookiesData.forEach((cookie) => {
      if (cookie.name && cookie.value) {
        res.cookie(cookie.name, cookie.value, {
          httpOnly: cookie.httpOnly ?? true,
          secure: false, // Set to true for production
          expires: cookie.expires,
          sameSite: cookie.sameSite ?? 'lax',
          path: cookie.path ?? '/',
        });
      } else {
        throw new Error('Invalid cookie: Name and value must be provided.');
      }
    });

    // Set the response content if provided (binary/text)
    if (content) {
      if (!(content instanceof Buffer || content instanceof Uint8Array || typeof content === "string")) {
        throw new Error("Invalid content type provided for binary or text response.");
      }

      res.setHeader("Content-Type", contentType);
      return res.status(status).send(content);
    } else {
      // Default to sending JSON response if no content is provided
      const responseBody = { message, data };
      res.setHeader("Content-Type", "application/json");
      return res.status(status).json(responseBody);
    }
    
  } catch (error) {
    console.log("Error creating custom response:", error);

    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}

module.exports = customResponse;
