import express, { Express, Request, Response } from "express";
import cors from 'cors
import errorhandler from "./middleware/error";
import auth from "./routes/user.route";
import purchaseCoin from "./routes/purchaseCoin.route";
import purchaseProvision from "./routes/purchaseprovision.route";
import transaction from "./routes/transaction.route";

const app: Express = express();

app.use(express.json());
app.use(cors()

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
