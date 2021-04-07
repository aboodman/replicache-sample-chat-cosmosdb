import {execProc} from "../../db";
import Pusher from "pusher";

export default async (req, res) => {
  const push = req.body;
  console.log("Processing push", JSON.stringify(push, null, ""));

  const t0 = Date.now();
  try {
    const result = await execProc("push", [push.clientID, push.mutations]);
    console.log("Got push response: ", result);
    await sendPoke();
    res.send("ok");
  } catch (e) {
    console.error(e);
    res.status(500).send(e.toString());
  } finally {
    console.log("Processed push in", Date.now() - t0);
  }
}

async function sendPoke() {
  const pusher = new Pusher({
    appId: process.env.NEXT_PUBLIC_REPLICHAT_PUSHER_APP_ID,
    key: process.env.NEXT_PUBLIC_REPLICHAT_PUSHER_KEY,
    secret: process.env.NEXT_PUBLIC_REPLICHAT_PUSHER_SECRET,
    cluster: process.env.NEXT_PUBLIC_REPLICHAT_PUSHER_CLUSTER,
    useTLS: true,
  });
  const t0 = Date.now();
  await pusher.trigger("default", "poke", {});
  console.log("Sent poke in", Date.now() - t0);
}
