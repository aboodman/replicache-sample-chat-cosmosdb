// @ts-check

/**
 * @param {string} clientID
 * @param {Mutation[]} mutations
 */
function push(clientID, mutations) {
  exec(async () => {
    const version = (await getLastVersion()) + 1;
    let lastMutationID = await getLastMutationID(clientID);
    for (let m of mutations) {
      const expectedMutationID = lastMutationID + 1;
      if (m.id > expectedMutationID) {
        throw new Error(
          `Mutation ID ${m.id} is too high - next expected mutation is ${expectedMutationID}`,
        );
      }
    
      if (m.id < expectedMutationID) {
        console.log(`Mutation ${m.id} has already been processed. Skipping.`);
        continue;
      }
    
      const {name, args} = m;
      switch (name) {
        case "createMessage":
          await createMessage(args, version);
          break;
        // TODO: Additional mutators as neccesary.
        default:
          throw new Error(`Unknown mutation: ${name}`);
        }
        lastMutationID = m.id;
      }
      await setLastMutationID(clientID, lastMutationID);
    });
}
