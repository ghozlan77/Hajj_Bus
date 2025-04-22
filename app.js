const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const dotenv = require("dotenv");
dotenv.config({ path: './config.env' });

dotenv.config();

// // const connectDB = require("./config/db");
const userRoutes = require("./routes/users");
const busRoutes = require("./routes/busRoutes");
const hajjRequestRoutes = require("./routes/hajjRequests");

 const app = express();

 app.use(express.json());


if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

  
app.use("/api/v1/buses", busRoutes);
app.use("/api/vi/requests", hajjRequestRoutes);
app.use("/api/v1/users", userRoutes);




//server
mongoose
.connect(process.env.DB_URI)
.then((conn) => {
  console.log(`Database Connected: ${conn.connection.host}`);
})
.catch((err) => {
  console.error(`Database Error: ${err}`);
  process.exit(1);
});
 const PORT = process.env.PORT || 3000;
 app.listen(PORT, () => console.log(` Server running on port ${PORT}`));