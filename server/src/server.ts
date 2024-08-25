import app from "./app";
import connect from "./utils/db";
import { ENV_DATA } from "./utils/envData";

const PORT = ENV_DATA.PORT;
// const startServer = async () => {
//   app.listen(PORT);
//   await connect();
//   console.log("Server started");
// };
// startServer();

app.listen(PORT, async () => {
  console.log("Server started");
  await connect();
});
