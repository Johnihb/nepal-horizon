import express from "express";


const PORT: number = 5001;
const app = express()
app.use(express.json())


app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
