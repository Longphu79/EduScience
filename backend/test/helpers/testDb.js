import mongoose from "mongoose";

const TEST_MONGO_URI = process.env.TEST_MONGO_URI;
const TEST_MONGO_URI_BASE =
  process.env.TEST_MONGO_URI_BASE || "mongodb://127.0.0.1:27017";

export const buildTestMongoUri = (dbName) =>
  TEST_MONGO_URI || `${TEST_MONGO_URI_BASE}/${dbName}`;

export const connectTestDatabase = async (dbName) => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await mongoose.connect(buildTestMongoUri(dbName), {
    autoIndex: true,
    serverSelectionTimeoutMS: 5_000,
  });
};

export const clearDatabase = async () => {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  const { collections } = mongoose.connection;

  for (const collection of Object.values(collections)) {
    await collection.deleteMany({});
  }
};

export const disconnectTestDatabase = async ({ drop = true } = {}) => {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  if (drop) {
    await mongoose.connection.dropDatabase();
  }

  await mongoose.disconnect();
};
