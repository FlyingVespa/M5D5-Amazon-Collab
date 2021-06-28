import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import listEndpoints from "express-list-endpoints";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

// import productRouter from "./services/products/index.js";
import reviewsRouter from "./services/reviews/index.js";
import {
  badRequestErrorHandler,
  notFoundErrorHandler,
  catchAllErrorHandler,
  forbiddenHandler,
} from "./errorHandlers.js";
dotenv.config();
console.log(process.env.PORT);
const { PORT } = process.env;
const server = express();
const publicFolderPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../public"
);

// const whitelist = [
//   process.env.FRONTEND_DEV_URL,
//   process.env.FRONTEND_CLOUD_URL,
// ];

// const corsOptions = {
//   origin: function (origin, next) {
//     console.log("ORIGIN", origin);
//     if (whitelist.indexOf(origin) !== -1) {
//       next(null, true);
//     } else {
//       next(new Error("CORS TROUBLES!!!!!"));
//     }
//   },
// };

//************************************ REQ SERVER IMPORT USES**********************
server.use(express.json());
server.use(cors());
// ******************************************ROUTES***************************

// server.use("/products", productRouter);
server.use("/reviews", reviewsRouter);

// ************************************ ERROR HANDLERS ******************************
server.use(notFoundErrorHandler);
server.use(badRequestErrorHandler);
server.use(forbiddenHandler);
server.use(catchAllErrorHandler);

console.table(listEndpoints(server));
server.listen(PORT, () =>
  console.log(`✅ A portal has opened on ${PORT} , enter if you dare`)
);

server.on("error", (error) =>
  console.log(`❌ Server is not running due to the following oopsie : ${error}`)
);
// You are in charge of building the Backend using NodeJS + Express. The backend should include the following features:
// CRUD for Products ( /products GET, POST, DELETE, PUT)
// CRUD for Reviews ( /reviews GET, POST, DELETE, PUT)
// Extra method for product's image upload (POST /product/:id/upload)
// Add an extra method to get all the reviews of a specific product (GET /products/:id/reviews)
// GET /products?category=book => Filter by category, should return only products belonging to the specified category
// [EXTRA] Connect this app to your previous Marketplace from Module 3 or create a new one in ReactJS

// NOTE:

// For both Products and Reviews, the field createdAt should be set when adding the current product/review to the list.
// The UpdatedAt should be equal to createdAt on creation and then change for each and every PUT on that very item.
