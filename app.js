import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import userRoutes from "./router/user.js";
import cors from 'cors'; // Import the cors middleware

dotenv.config();

const app = express();

app.use(bodyParser.json());

// Enable CORS for all routes
app.use(cors());

app.use('', userRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
