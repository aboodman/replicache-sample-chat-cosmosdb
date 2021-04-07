// @ts-check

/**
 * @param {string} clientID
 * @param {string} prevCookie
 */
function pull(clientID, prevCookie) {
  exec(async () => {
    const changes = await getMessages(prevCookie);
    console.log("changes: %s", changes);
    const newCookie = await getLastVersion();
    const lastMutationID = await getLastMutationID(clientID);

    return {
      lastMutationID,
      cookie: newCookie,
      // TODO: Handle "del" when messages can be deleted.
      patch: changes.map(message => ({
        op: "put",
        value: message,
      })),
    };
  });
}
