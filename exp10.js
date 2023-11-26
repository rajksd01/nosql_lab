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

    // Call the methods for Experiment 10
    await averageClassScore(collection);
    await employeeCountFailInAllTerms(collection);
    await employeeCountFailAtLeastATerm(collection);

    // Close the connection
   
  } catch (exception) {
    console.error(exception);
  }
}

/**
 * Function to find the Average score of trainees for aggregate (term1 + term2 + term3)
 */
async function averageClassScore(collection) {
  console.log(
    " 4. Find the Average score of trainees for aggregate (term1 + term2 + term3) "
  );

  const pipeline = [
    { $unwind: "$results" },
    {
      $group: {
        _id: "$name",
        Average: { $avg: "$results.score" },
      },
    },
  ];

  const result = await collection.aggregate(pipeline).toArray();
  console.log(result);
}

/**
 * Function to find the number of employees who failed in all three (term1 + term2 + term3)
 */
async function employeeCountFailInAllTerms(collection) {
  console.log(
    "5. Find number of employees who failed in all the three (term1 + term2 + term3) "
  );

  const count = await collection.countDocuments({
    "results.0.score": { $lt: 37 },
    "results.1.score": { $lt: 37 },
    "results.2.score": { $lt: 37 },
  });

  console.log(`Count of employees failing in all terms: ${count}`);
}

/**
 * Function to find the number of employees who failed in any of the three (term1 + term2 + term3)
 */
async function employeeCountFailAtLeastATerm(collection) {
  console.log(
    " 6. Find the number of employees who failed in any of the three (term1 + term2 + term3)"
  );

  const count = await collection.countDocuments({
    $or: [
      { "results.0.score": { $lt: 37 } },
      { "results.1.score": { $lt: 37 } },
      { "results.2.score": { $lt: 37 } },
    ],
  });

  console.log(`Count of employees failing in either of the terms: ${count}`);
}

// Run the main function for Experiment 10
main();
