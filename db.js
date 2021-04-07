import {CosmosClient} from "@azure/cosmos";
import * as fs from 'fs/promises';

const endpoint = mustEnv("REPLICHAT_COSMOSDB_ENDPOINT");
const key = mustEnv("REPLICHAT_COSMOSDB_KEY");
const databaseID = mustEnv("REPLICHAT_COSMOSDB_DATABASE_ID");
const containerID = mustEnv("REPLICHAT_COSMOSDB_CONTAINER_ID");
const partitionValue = "p1";

export async function initDB() {
  const client = new CosmosClient({ endpoint, key });
  await client.database(databaseID).delete();
  await client.databases.createIfNotExists({
    id: databaseID,
  });
  const {container} = await client.database(databaseID).containers.createIfNotExists({
    id: containerID,
  });

  await registerStoredProcedures(container);
}

export async function execProc(name, params) {
  const client = new CosmosClient({ endpoint, key });
  const container = client.database(databaseID).container(containerID);
  const response = await container.scripts.storedProcedure(name).execute(
    partitionValue, params, {enableScriptLogging: true});
  const log = response.headers["x-ms-documentdb-script-log-results"];
  console.log("proc log:", log ? unescape(log) : "");
  return response.resource;
}

async function registerStoredProcedures(container) {
  // TODO: Right thing to do is to version or hash these names to correctly deal with deployment.
  const shared = ["client-state", "cosmos", "message"];
  const procs = ["pull", "push"];

  // I am embarassed writing this, but the JS env stored procs run in appears to lack `import` support.
  let sharedSource = "";
  for (let s of shared) {
    sharedSource += await fs.readFile(`./js/shared/${s}.js`, "utf-8");
    sharedSource += "\n\n";
  }

  for (let s of procs) {
    await container.scripts.storedProcedures.create({
      id: s,
      body: await fs.readFile(`./js/procs/${s}.js`, "utf-8") + sharedSource,
    });
  }
}

function mustEnv(name) {
  const r = process.env[name];
  if (!r) {
    throw new Error(`Required environment variable ${name} not found`);
  }
  return r;
}
