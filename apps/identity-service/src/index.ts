import "dotenv/config";
import express, { type Request, type Response } from "express";

const app = express();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Identity Service is running");
});

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Identity service running on port ${PORT}`);
});