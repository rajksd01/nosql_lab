const { MongoClient } = require("mongodb");

async function main() {
  try {
    // Creating a MongoDB client with default connection host: localhost, port: 27017
    const uri = "mongodb://127.0.0.1:27017";

    const client = new MongoClient(uri);

    // Connect to the MongoDB server
    await client.connect();
    console.log("Connected to the MongoDB server");

    // Fetching a database with the name "employee"
    const db = client.db("employee");

    // Fetching the "training" collection from the "employee" database
    const collection = db.collection("training");

    // Find one record
    findFailedStudInTerm1(collection);

    // Failed employees in aggregate (term1 + term2 + term3)
    failedInAggregate(collection);

    // Average score of trainees in term1
    averageScoreTerm1(collection);

    // Average score of the class for aggregate (term1 + term2 + term3)
    averageClassScore(collection);

    // Count of employees failed in all three terms
    employeeCountFailInAllTerms(collection);

    // Count of employees failed in either of three terms
    employeeCountFailAtLeastATerm(collection);
  } catch (exception) {
    console.error(exception);
  }
}

/**
 * Function to find a record input: MongoDB collection
 * 1. Find count and percentage of employees who failed in term 1, the passing score being 37
 */
async function findFailedStudInTerm1(collection) {
  const count = await collection.countDocuments({
    "results.evaluation": "term1",
    "results.score": { $lt: 37 },
  });

  const totalStudents = await collection.countDocuments({});
  const perStud = (count * 100) / totalStudents;

  console.log(
    `Number of students failed in exams in Term1: passing marks 37 ======> ${count}`
  );
  console.log(
    `Percentage of students failed in exams in Term1: passing marks 37 ======> ${perStud} %`
  );

  return perStud;
}

/**
 * Function to find failed employees in aggregate (term1 + term2 + term3)
 */
async function failedInAggregate(collection) {
  const pipeline = [
    {
      $match: {
        $or: [
          { "results.evaluation": "term1", "results.score": { $lt: 37 } },
          { "results.evaluation": "term2", "results.score": { $lt: 37 } },
          { "results.evaluation": "term3", "results.score": { $lt: 37 } },
        ],
      },
    },
  ];

  const result = await collection.aggregate(pipeline).toArray();
  console.log(
    "  Failed employees in aggregate (term1 + term2 + term3) ",
    result
  );
}

/**
 * Function to find average score of trainees in term1
 */
async function averageScoreTerm1(collection) {
  const pipeline = [
    {
      $unwind: "$results",
    },
    {
      $match: {
        "results.evaluation": "term1",
      },
    },
    {
      $group: {
        _id: null,
        averageScore: { $avg: "$results.score" },
      },
    },
  ];

  const result = await collection.aggregate(pipeline).toArray();
  console.log(" Average score of trainees in term1 ", result);
}

/**
 * Function to find average score of the class for aggregate (term1 + term2 + term3)
 */
async function averageClassScore(collection) {
  const pipeline = [
    {
      $unwind: "$results",
    },
    {
      $group: {
        _id: null,
        averageScore: { $avg: "$results.score" },
      },
    },
  ];

  const result = await collection.aggregate(pipeline).toArray();
  console.log(
    "Average score of the class for aggregate (term1 + term2 + term3) ",
    result
  );
}

/**
 * Function to find count of employees failed in all three terms
 */
async function employeeCountFailInAllTerms(collection) {
  const pipeline = [
    {
      $match: {
        "results.evaluation": { $in: ["term1", "term2", "term3"] },
        "results.score": { $lt: 37 },
      },
    },
    {
      $group: {
        _id: "$_id",
        count: { $sum: 1 },
      },
    },
    {
      $match: {
        count: { $gte: 3 }, // Count of failed evaluations in all three terms
      },
    },
    {
      $count: "totalCount",
    },
  ];

  const result = await collection.aggregate(pipeline).toArray();
  console.log(" 5. Count of employees failed in all three terms", result);
}

/**
 * Function to find count of employees failed in either of three terms
 */
async function employeeCountFailAtLeastATerm(collection) {
  console.log(" 6. Count of employees failed in either of three terms");

  const pipeline = [
    {
      $match: {
        "results.evaluation": { $in: ["term1", "term2", "term3"] },
        "results.score": { $lt: 37 },
      },
    },
    {
      $group: {
        _id: "$_id",
        count: { $sum: 1 },
      },
    },
    {
      $match: {
        count: { $gte: 1 }, // Count of failed evaluations in at least one term
      },
    },
    {
      $count: "totalCount",
    },
  ];

  const result = await collection.aggregate(pipeline).toArray();
  console.log(result);
}

// Run the script
main().catch(console.error);
