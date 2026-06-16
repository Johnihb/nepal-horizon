import express from "express";
import { toNodeHandler, fromNodeHeaders } from "better-auth/node";
import "dotenv/config";
import { auth } from "./lib/auth";
import cors from "cors"


const app = express();
const PORT:number = Number(process.env.PORT) || 5000;

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173"],
  credentials: true,
}))





app.all("/api/auth/*splat", toNodeHandler(auth));// For ExpressJS v5 
// Mount express json middleware after Better Auth handler
// or only apply it to routes that don't interact with Better Auth

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 



app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});