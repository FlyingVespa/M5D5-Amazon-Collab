import express from "express";
import fs from "fs-extra";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import multer from "multer";
import createHttpError from "http-errors";
import uniqid from "uniqid";
import { validationResult, body } from "express-validator";
import reviewValidation from "./reviewValidation.js";

const reviewsRouter = express.Router();

// PATHS
export const getFilePath = (filename) =>
  join(dirname(fileURLToPath(import.meta.url)), "../jsondata", filename);

// READ File PARSED
export const readFile = async (name) => {
  const filePath = getFilePath(name);
  const jsonFile = await fs.readJSON(filePath);
  return jsonFile;
};
// WRITE
export const writeToFile = async (filename, content) => {
  await fs.writeFileSync(getFilePath(filename), JSON.stringify(content));
};

// 1. GET ALL REVIEWS
reviewsRouter.get("/", async (req, res, next) => {
  try {
    const reviews = await readFile("reviews.json");
    res.send(reviews);
  } catch (error) {
    next(error);
  }
});

// 2. GET SINGLE

reviewsRouter.get("/:reviewId", async (req, res, next) => {
  try {
    const reviews = await readFile("reviews.json");
    const review = reviews.find((review) => review._id === req.params.reviewId);
    if (review) {
      res.send(review);
    } else {
      next(
        createHttpError(404, `the review ${req.params.reviewId} was not found`)
      );
    }
  } catch (error) {
    next(error);
  }
});

// 3. POST
reviewsRouter.post("/", reviewValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      const { comment, productId, rate } = req.body;
      const newReview = {
        _id: uniqid(),
        comment,
        productId,
        rate,
        createdAt: new Date(),
        lastModified: new Date(),
      };

      const reviews = await readFile("reviews.json");
      reviews.push(newReview);
      writeToFile("reviews.json", reviews);
      res.status(201).send({ _id: newReview._id });
    } else {
      next(createError(400, { errorsList: errors }));
    }
  } catch (error) {
    next(error);
  }
});
// 4. PUT

reviewsRouter.put("/:reviewId", async (req, res, next) => {
  try {
    const reviews = await readFile("reviews.json");
    const remainingReviews = reviews.filter(
      (review) => review._id !== req.params.reviewId
    );
    const { comment, productId, rate, ...createdAt } = req.body;
    const updatedReview = {
      ...req.body,
      _id: req.params.reviewId,
      comment,
      productId,
      ...createdAt,
      rate,

      lastModified: new Date(),
    };
    console.log(remainingReviews);
    console.log(updatedReview);
    if (remainingReviews) {
      remainingReviews.push(updatedReview);
      await writeToFile("reviews.json", remainingReviews);
    } else {
      createHttpError(404, `the review ${req.params.reviewId} was not found`);
    }
    res.send(updatedReview);
  } catch (error) {
    next(error);
  }
});
// 5.DELETE

reviewsRouter.delete("/:reviewId", async (req, res, next) => {
  try {
    const reviews = await readFile("reviews.json");
    const remainingReviews = reviews.filter(
      (review) => review._id !== req.params.reviewId
    );
    await writeToFile("authors.json", remainingReviews);
    res.status(200).send(`${req.params.reviewId} has been deleted`);
  } catch (error) {
    // next(error);
  }
});

// GET SPECIFITC PRODUCT REVIEW
// reviewsRouter("/");

export default reviewsRouter;
