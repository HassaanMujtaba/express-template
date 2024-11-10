const yup = require('yup');

/**
 * Function to validate input data against a schema.
 *
 * @param {Object} schema - The yup validation schema.
 * @param {Object} data - The input data to validate.
 * @throws {Object} - Throws an error object with a name and messages if the input is invalid.
 */
 async function validateInput(schema, data) {
  try {
    await schema.validate(data, { abortEarly: false });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      const messages = error.inner.map((e) => e.message);
      throw { name: "ValidationError", messages };
    } else {
      throw error;
    }
  }
}

module.exports ={validateInput}