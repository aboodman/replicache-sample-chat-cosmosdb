// @ts-check

/** @type {{[name: string]: (args: any) => Promise<void>}} */
const mutators = {
  __proto__: null,
  createMessage,
};

async function createMessage(message, version) {
  await createDocument(Object.assign({}, message, {
    id: messageID(message.id),
    version,
    _partitionKey: "p1",
  }));
}

async function getMessages(lastVersion) {
  return await queryDocuments(
    `SELECT c.id, c["from"], c.content, c["order"] FROM c WHERE c.id LIKE 'message-%' AND c.version > @lastVersion`, {
      "@lastVersion": lastVersion,
    });
}

async function getLastVersion() {
  const result = await queryDocuments("SELECT MAX(c.version) as lastVersion FROM c");
  const [{lastVersion}] = result;
  return lastVersion || 0;
}

function messageID(id) {
  return `message-${id}`;
}
