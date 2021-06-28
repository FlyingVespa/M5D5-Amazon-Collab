import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import listEndpoints from "express-list-endpoints";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

// import {
//   badRequestErrorHandler,
//   notFoundErrorHandler,
//   catchAllErrorHandler,
// } from "./errorHandlers.js";

dotenv.config();
console.log(process.env.PORT);
const { PORT } = process.env;
const server = express();

const publicFolderPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../public"
);
