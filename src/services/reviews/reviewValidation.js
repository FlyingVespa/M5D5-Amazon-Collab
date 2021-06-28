import { body } from "express-validator";

const reviewValidation = [
  body("user").exists().withMessage("You have to provide a user name"),
  body("rate").exists().withMessage("You have give a rating from 0-5"),
  body("text").exists().withMessage("You have to add a review content"),
];

export default reviewValidation;
