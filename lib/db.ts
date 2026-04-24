import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getClientPromise(): Promise<MongoClient> {
  if (!uri) {
    // Return a promise that never resolves but also doesn't throw
    // This allows the app to render gracefully without MongoDB
    return new Promise(() => {});
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  } else {
    if (!clientPromise) {
      client = new MongoClient(uri, options);
      clientPromise = client.connect();
    }
    return clientPromise;
  }
}

const clientPromiseExport = getClientPromise();

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db("ethiopia-remote-talent");
}

export async function getCollection<T extends Document>(name: string) {
  const db = await getDb();
  return db.collection<T>(name);
}

export default clientPromise;
