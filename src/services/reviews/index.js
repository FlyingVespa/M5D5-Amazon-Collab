import express from "express";
import fs from "fs-extra";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import multer from "multer";
import createHttpError from "http-errors";
import uniqid from "uniqid";
import validationResult from "express-validator";

const reviewsRouter = express.Router();
// PATHS

// WRITE

// 1. GET ALL
// 2. GET SINGLE
// 3. POST
// 4. PUT
// 5.DELETE
