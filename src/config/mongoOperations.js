const mongoose = require("mongoose");
const { UserModel } = require("../models");

// Define the collection models table
const collectionsTable = { UserModel };

// Retrieve MongoDB connection string from environment variables
const connectionString = process.env.MONGO_URI;

if (!connectionString) {
  console.log("MONGO_URI not found in environment variables");
  process.exit(1);
}

// Function to connect to MongoDB
const connectDb = async () => {
  try {
    await mongoose.connect(connectionString, {});
    console.log('\x1b[32m%s\x1b[0m',"DB Connected Successfully");
  } catch (error) {
    handleDbError("Error Connecting DB:", error);
  }
};



/**
 * Handles database errors by printing them and exiting the process if critical.
 * @param {string} message - The error message to display.
 * @param {Error} error - The error object containing details.
 */
const handleDbError = (message, error) => {
  console.log(message, error);
  process.exit(1);
};

/**
 * Retrieves the model for a specified collection.
 *
 * @param {string} collection - The name of the collection.
 * @returns {mongoose.Model} - The Mongoose model corresponding to the collection.
 * @throws {Error} If the model for the collection is not found.
 */
const getModel = (collection) => {
  if (!collectionsTable[collection]) {
    console.log(`Model for collection '${collection}' not found`);
    throw new Error(`Model for collection '${collection}' not found`);
  }
  return collectionsTable[collection];
};

/**
 * Validates and formats the input data for the specified operation.
 *
 * @param {string} operation - The type of operation being performed.
 * @param {Object} data - The data provided for the operation.
 * @throws {Error} If the input data is invalid.
 */
const validateAndFormatData = (operation, data) => {
  switch (operation) {
    case "create":
      if (!data.object || typeof data.object !== "object") {
        throw new Error("Invalid object for create operation");
      }
      break;

    case "updateOne":
    case "updateMany":
      if (!data.query || !data.updateData) {
        throw new Error(
          `Invalid query or updateData for ${operation} operation`
        );
      }
      break;

    case "deleteOne":
    case "deleteMany":
    case "findOne":
    case "find":
    case "findWith":
    case "search":
      if (!data.query) {
        throw new Error(`Invalid query for ${operation} operation`);
      }
      break;

    case "findMany":
      if (!Array.isArray(data.ids) || data.ids.length === 0) {
        throw new Error("Invalid ids for findMany operation");
      }
      break;

    case "aggregate":
      if (!Array.isArray(data.pipeline)) {
        throw new Error("Invalid pipeline for aggregate operation");
      }
      break;

    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }
};

/**
 * Builds a query with optional parameters such as limit, skip, sort, and select.
 *
 * @param {Object} query - The initial MongoDB query object.
 * @param {Object} data - Additional query options (limit, skip, select, sort).
 * @returns {Object} - The MongoDB query object with applied options.
 */
const buildQuery = (query, data) => {
  if (data.sort) query = query.sort(data.sort);
  if (data.limit) query = query.limit(data.limit);
  if (data.skip) query = query.skip(data.skip);
  if (data.select) query = query.select(data.select);
  return query;
};

/**
 * Executes a MongoDB query and logs its execution time.
 *
 * @param {Function} queryFunction - The function to execute the query.
 * @returns {Promise} - The result of the query execution.
 */
const executeQuery = async (queryFunction) => {
  const start = Date.now();
  try {
    const result = await queryFunction();
    console.log(`Query executed in ${Date.now() - start}ms`);
    return result;
  } catch (error) {
    console.log("Error executing query:", error);
    throw error;
  }
};

/**
 * Executes a MongoDB operation with the provided parameters.
 *
 * @param {Object} params - Parameters for the MongoDB operation.
 * @param {string} params.collection - The name of the collection to perform the operation on.
 * @param {string} params.operation - The type of operation to perform (e.g., 'count', 'create', 'find').
 * @param {Object} [params.data={}] - Additional data required for the operation.
 * @returns {Promise} - The result of the MongoDB operation.
 * @throws {Error} If an unsupported operation is specified or input validation fails.
 */
const mongoOperation = async ({ collection, operation, data = {} }) => {
  const model = getModel(collection);

  // Validate and format input data based on operation
  validateAndFormatData(operation, data);

  // Switch case for different MongoDB operations
  switch (operation) {
    case "count":
      return executeQuery(() => model.countDocuments(data.query || {}));

    case "create":
      return executeQuery(() => new model(data.object).save());

    case "findOne":
      return executeQuery(() => model.findOne(data.query));

    case "find":
      return executeQuery(() => buildQuery(model.find(data.query), data));

    case "updateOne":
      return executeQuery(() => model.updateOne(data.query, data.updateData));

    case "updateMany":
      return executeQuery(() => model.updateMany(data.query, data.updateData));

    case "deleteOne":
      return executeQuery(() => model.deleteOne(data.query));

    case "deleteMany":
      return executeQuery(() => model.deleteMany(data.query));

    case "findWith":
      return executeQuery(() => buildQuery(model.find(data.query), data).exec());

    case "findMany":
      return executeQuery(() => model.find({ _id: { $in: data.ids } }));

    case "search":
      return executeQuery(() => model.find({ $text: { $search: data.query } }));

    case "aggregate":
      return executeQuery(() => model.aggregate(data.pipeline).exec());

    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }
};

module.exports = {mongoOperation, connectDb};
