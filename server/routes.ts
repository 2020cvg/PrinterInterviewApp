import { MongoMemoryServer } from "mongodb-memory-server";

import express from "express";
import { MongoClient, Collection } from "mongodb";
const app = express();
const PORT = process.env.PORT || 4000;
const cors = require("cors");
app.use(cors());
let db;

type UserType = {
  _id: string;
  // Whether this is a printer or not
  printer?: boolean;
  // Unique name for each user and printer
  name: string;
  // The user that owns this printer
  owner?: string;
  // Whether the user is an admin
  isAdmin?: boolean;
  presence: {
    updatedAt: Date;
    // The server the printer is connected to
    serverId: string;
    clientAddress?: string;
    httpHeader?: Record<string, string>;
    status: "online" | "offline";
  };
  // Printers this user owns
  printer_ids?: string[];
};

// Start an in-memory MongoDB server
const mongoServer = null;
export const Collections: {
  users: Collection<UserType> | null;
} = {
  users: null
};
// Connect to the MongoDB database
MongoMemoryServer.create()
  .then(async (mongoServer: MongoMemoryServer) => {
    const mongoUri = mongoServer.getUri();
    const client = new MongoClient(mongoUri);
    await client.connect();
    db = client.db();
    console.log("Connected to in-memory MongoDB server");

    // Example data: Printer information for different users
    const users: UserType[] = [
      {
        _id: "1",
        name: "User A",
        printer_ids: ["2", "6", "7"],
        presence: { updatedAt: new Date(), serverId: "1", status: "online" }
      },
      {
        _id: "2",
        owner: "1",
        name: "Printer A",
        printer: true,
        presence: { updatedAt: new Date(), serverId: "1", status: "online" }
      },
      { _id: "3", name: "User C", isAdmin: true, presence: { updatedAt: new Date(), serverId: "1", status: "online" } },
      {
        _id: "4",
        owner: "5",
        name: "Printer B",
        printer: true,
        presence: { updatedAt: new Date(), serverId: "1", status: "offline" }
      },
      {
        _id: "5",
        name: "User B",
        printer_ids: ["4"],
        presence: { updatedAt: new Date(), serverId: "1", status: "online" }
      },
      {
        _id: "6",
        owner: "1",
        name: "Printer C",
        printer: true,
        presence: { updatedAt: new Date(), serverId: "1", status: "online" }
      },
      {
        _id: "7",
        owner: "1",
        name: "Printer D",
        printer: true,
        presence: { updatedAt: new Date(), serverId: "1", status: "online" }
      }
    ];
    // Populate the printers collection with example data
    Collections.users = db.collection("users");
    Collections.users.insertMany(users);
    console.log("Example printer data inserted into database");
  })
  .catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });

// Function to tell if a user is a printer or a normal printer
function userIsPrinter(user: UserType): boolean {
  return !!user.printer;
}

// Function to find all printers connected to this user
function findUserPrinters(user: UserType): Promise<UserType[]> {
  const options: {
    // Map of which fields to return
    // ex: {_id: 1, name:1} would make sure only _id and name are returned
    fields?: Record<string, 1>;
    // Map of which fields to sort by
    // ex: {name:1, _id:-1} would make sort the result by name, and then for any items that match would sort by _id in reverse order
    sort?: Record<string, 1 | -1>;
    // How many items to return
    limit?: number;
    // How many items to skip
    skip?: number;
  } = {};
  if (!Collections.users) {
    throw new Error("Invalid setup");
  }
  return Collections.users.find({ owner: user._id }, options).toArray();
}

function findUserById(id: string): Promise<UserType | null> {
  if (!Collections.users) {
    throw new Error("Invalid setup");
  }
  return Collections.users.findOne({ _id: id });
}

// Route to get printer information by user ID
app.get("/printer-information/:userId", (req: any, res: any) => {
  // For simplicity we assume the user is fully authenticated
  const userId = req.params.userId;
  res.json([{ name: "example" }]);
  res.status(200);
});


// Define a route to fetch data from the collection
app.get("/api/data", async (req: any, res: any) => {
  try {
    // Access the collection
    const collection = db.collection('users');

    // Query data from the collection
    const data = await collection.find({}).toArray();

    // Return the data as a JSON response
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
    process.exit(1);
  }
});

// Define a route to delete a record from the collection
app.delete("/remove-printer/:id", async (req, res) => {
  try {
    // Access the collection
    const collection = db.collection('users');

    // Extract the ID from the request parameters
    const id = req.params.id;

    // Delete the record with the specified ID
    const result = await collection.deleteOne({ _id: id });

    // Check if a record was deleted
    if (result.deletedCount === 1) {
      res.json({ message: 'Record deleted successfully' });
    } else {
      res.status(404).json({ error: 'Record not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
    process.exit(1);
  }
});

// Define a route to remove a printer from a user
app.patch("/remove-printer-from-user/:owner/:printerId", async (req, res) => {
  try {
    // Access the collection
    const collection = db.collection('users');

    // Extract the printer ID and owner ID from the request parameters
    const owner = req.params.owner;
    const printerId = req.params.printerId;

    // Update the user document to remove the printer ID from printer_ids
    const user_result = await collection.updateOne(
      { _id: owner },
      { $pull: { printer_ids: printerId } }
    );

    // Update the printer document to remove the owner ID from owner
    const printer_result = await collection.updateOne(
      { _id: printerId },
      { $set: { owner: 0 } }
    );

    // Check if the update was successful
    if (user_result.modifiedCount === 1) {
      res.json({ message: 'Printer removed from user successfully' });
    } else {
      res.status(404).json({ error: 'Printer or user not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
    process.exit(1);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});