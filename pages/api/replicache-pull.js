import {execProc} from "../../db";

export default async (req, res) => {
  const pull = req.body;
  console.log(`Processing pull`, JSON.stringify(pull, null, ''));
  const t0 = Date.now();

  try {
    const result = await execProc("pull", [pull.clientID, pull.cookie ?? 0]);
    console.log("Got pull response: ", result);
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).send(e.toString());
  } finally {
    console.log("Processed pull in", Date.now() - t0);
  }
};
