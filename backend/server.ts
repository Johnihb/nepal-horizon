import express from "express";
import { toNodeHandler } from "better-auth/node";
import "dotenv/config";
import { auth } from "./lib/auth.ts";
import cors from "cors"
import morgan from "morgan";


import imageRouter from "./routes/image.route.ts";
import adminRouter from "./routes/admin.route.ts";
import userRouter from "./routes/user.route.ts";



const app = express();
const PORT:number = Number(process.env.PORT) || 5000;

app.use(cors({
  origin:"http://localhost:3000",
  credentials: true,
}))

if(process.env.NODE_ENV as string === "development") {
  // app.use(morgan("combined"))
  app.use(morgan("dev"))
  
}



app.all("/api/auth/*splat", toNodeHandler(auth));// For ExpressJS v5 
// Mount express json middleware after Better Auth handler
// or only apply it to routes that don't interact with Better Auth


app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 






app.use("/api/v1/admin",adminRouter);
app.use("/api/v1/user",userRouter);
app.use("/api/images", imageRouter);




app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});