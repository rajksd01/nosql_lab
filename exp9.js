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

    // Call the methods for Experiment 9
    await failedInAggregate(collection);
    await averageScoreTerm1(collection);
  } catch (exception) {
    console.error(exception);
  }
}


 // Function to find employees who failed in aggregate (term1 + term2 + term3)
 
async function failedInAggregate(collection) {
  console.log(
    " 2.Find employees who failed in aggregate (term1 + term2 + term3) "
  );

  const pipeline = [
    { $unwind: "$results" },
    {
      $group: {
        _id: "$name",
        total: { $sum: "$results.score" },
      },
    },
    { $match: { total: { $lt: 111 } } },
  ];

  const result = await collection.aggregate(pipeline).toArray();
  console.log(
    "employees who failed in aggregate (term1 + term2 + term3)",
    result
  );
}
 // Function to find the Average score of trainees for term1

async function averageScoreTerm1(collection) {
  console.log(" 3. Find the Average score of trainees for term1 ");

  const pipeline = [
    { $unwind: "$results" },
    { $match: { "results.evaluation": "term1" } },
    {
      $group: {
        _id: null,
        Average: { $avg: "$results.score" },
      },
    },
  ];

  const result = await collection.aggregate(pipeline).toArray();
  console.log("the Average score of trainees for term1 ", result);
}

// Run the main function for Experiment 9
main();
