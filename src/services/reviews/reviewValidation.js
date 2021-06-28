import { body } from "express-validator";

const reviewValidation = [
  //   body("productId").exists().withMessage("You have to provide product Id"),
  body("rate").exists().withMessage("You have give a rating from 0-5"),
  body("comment").exists().withMessage("You have to add a review content"),
];

export default reviewValidation;
