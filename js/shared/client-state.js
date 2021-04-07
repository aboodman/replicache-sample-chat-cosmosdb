// @ts-check

/**
 * @param {string} clientID
 * @return {Promise<number>}
 */
 async function getLastMutationID(clientID) {
  const value = await queryDocuments(
    "SELECT c.lastMutationID FROM c WHERE c.id = @id", {
      "@id": clientStateID(clientID)
    });
  if (value.length === 0) {
    return 0;
  }
  return value[0].lastMutationID;
}

/**
 * @param {string} clientID
 * @param {number} lastMutationID
 * @return {Promise<void>}
 */
async function setLastMutationID(clientID, lastMutationID) {
  await upsertDocument({
    "id": clientStateID(clientID),
    lastMutationID,
    _partitionKey: "p1",
  });
}

/**
 * @param {string} clientID 
 */
function clientStateID(clientID) {
  return `client-state-${clientID}`;
}
