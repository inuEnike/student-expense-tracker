import app from "./app";
import connect from "./utils/db";
import { ENV_DATA } from "./utils/envData";
import ngrok, { listeners } from "@ngrok/ngrok";

const PORT = ENV_DATA.PORT;
const startServer = async () => {
  app.listen(PORT);
  await connect();
  console.log("Server started");
  (async function () {
    // Establish connectivity
    const listener = await ngrok.forward({
      addr: PORT,
      // authtoken_from_env: true,
      authtoken: ENV_DATA.NGROK_API_KEY,
    });

    // Output ngrok url to console
    console.log(`Ingress established at: ${listener.url()}`);
  })();
  console.log(ENV_DATA.NGROK_API_KEY);
};
startServer();
