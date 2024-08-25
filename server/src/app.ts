import express, { Express, Request, Response } from "express";
import britannia from "britannia";
import cors from "cors";
import errorhandler from "./middleware/error";
import auth from "./routes/user.route";
import purchaseCoin from "./routes/purchaseCoin.route";
import purchaseProvision from "./routes/purchaseprovision.route";
import transaction from "./routes/transaction.route";

// Define CORS options
const corsOptions = {
  origin: "*", // Replace with your client's URL
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  optionsSuccessStatus: 204,
};

const app: Express = express();

app.use(britannia());
// Use CORS with the specified options
app.use(cors(corsOptions));

app.use(express.json());

let prefix = `/api/v1`;

app.use(`${prefix}/auth`, auth);
app.use(`${prefix}/coin`, purchaseCoin);
app.use(`${prefix}/provision`, purchaseProvision);
app.use(`${prefix}/transaction`, transaction);

app.all("*", (req: Request, res: Response) => {
  res.status(404).json({ message: "No route found" });
});

app.use(errorhandler);

export default app;
