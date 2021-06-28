import express from "express"
import fs from "fs"
import path, { dirname, join } from "path"
import { fileURLToPath } from "url"
import uniqid from "uniqid"
import multer from "multer"
import reviewValidation from "../reviews/reviewValidation.js"
import { validationResult, body } from "express-validator"
import { readFile, getFilePath, writeToFile } from "../reviews/index.js"
import createHttpError from "http-errors"

const fileName = fileURLToPath(import.meta.url)
const directoryName = dirname(fileName)
const productsFilePath = path.join(directoryName, "products.json")
const router = express.Router()

//get all products
router.get("/", async (req, res, next) => {
  try {
    const fileAsBuffer = fs.readFileSync(productsFilePath)
    const fileAsString = fileAsBuffer.toString()
    const fileAsJson = JSON.parse(fileAsString)
    if (req.query.category) {
      const product = fileAsJson.filter(
        (product) => product.category === req.query.category
      )
      res.send(product)
    } else {
      res.send(fileAsJson)
    }
  } catch (error) {
    res.send(500).send({ message: error.message })
  }
})

//get single product
router.get("/:id", async (req, res, next) => {
  try {
    const fileAsBuffer = fs.readFileSync(productsFilePath)
    const fileAsString = fileAsBuffer.toString()
    const fileAsJson = JSON.parse(fileAsString)
    const product = fileAsJson.find((product) => product._id === req.params.id)
    if (!product) {
      res
        .status(404)
        .send({ message: `product with ${req.params.id} not found!` })
    } else {
      res.send(product)
    }
  } catch (error) {
    res.status(500).send({ message: error.message })
  }
})

//create product
router.post("/", async (req, res, next) => {
  try {
    const { productName, description, brand, price, category } = req.body
    const product = {
      _id: uniqid(),
      productName,
      description,
      brand,
      price,
      category,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const fileAsBuffer = fs.readFileSync(productsFilePath)
    const fileAsString = fileAsBuffer.toString()
    const fileAsJson = JSON.parse(fileAsString)
    fileAsJson.push(product)
    fs.writeFileSync(productsFilePath, JSON.stringify(fileAsJson))
    res.send(product)
  } catch (error) {
    res.status(500).send({ message: error.message })
  }
})

router.post("/:id/upload", async (req, res, next) => {
  //     const fileAsBuffer = fs.readFileSync(productsFilePath)
  //     const fileAsString = fileAsBuffer.toString()
  //     const fileAsJson = JSON.parse(fileAsString)
  //     const product = fileAsJson.find(product => product.id === req.params.id)
})

//ammend product
router.put("/:id", async (req, res, next) => {
  try {
    const fileAsBuffer = fs.readFileSync(productsFilePath)
    const fileAsString = fileAsBuffer.toString()
    let fileAsJson = JSON.parse(fileAsString)
    const productIndex = fileAsJson.findIndex(
      (product) => product._id === req.params.id
    )
    if (!productIndex == -1) {
      res
        .status(404)
        .send({ message: `product with ${req.params.id} not found!` })
    }
    const previousProductData = fileAsJson[productIndex]
    const changedProduct = {
      ...previousProductData,
      ...req.body,
      updatedAt: new Date(),
    }
    fileAsJson[productIndex] = changedProduct
    fs.writeFileSync(productsFilePath, JSON.stringify(fileAsJson))
    res.send(changedProduct)
  } catch (error) {
    res.status(500).send({ message: error.message })
  }
})

//delete product
router.delete("/:id", async (req, res, next) => {
  try {
    const fileAsBuffer = fs.readFileSync(productsFilePath)
    const fileAsString = fileAsBuffer.toString()
    let fileAsJson = JSON.parse(fileAsString)
    const product = fileAsJson.find((product) => product._id === req.params.id)
    if (!product) {
      return res
        .status(404)
        .send({ message: "product with ${req.params.id} not found!" })
    }
    fileAsJson = fileAsJson.filter((product) => product._id !== req.params.id)
    fs.writeFileSync(productsFilePath, JSON.stringify(fileAsJson))
    res.status(204).send({ message: "Deleted" })
  } catch (error) {
    res.status(500).send({ message: error.message })
  }
})

// **************************************TEST********************

// GET REVIEWS
router.get("/:id/review", async (req, res, next) => {
  try {
    const reviews = await readFile("reviews.json")
    const productReviews = reviews.filter(
      (review) => review.productId === req.params.id
    )
    res.send(productReviews)
  } catch (error) {
    next(error)
  }
})

// Get single
router.get("/:id/review/:reviewId", async (req, res, next) => {
  try {
    const reviews = await readFile("reviews.json")
    const filterReview = reviews.find((r) => r._id === req.params.reviewId)

    if (filterReview) {
      res.send(filterReview)
    } else {
      next(
        createHttpError(404, `the review ${req.params.reviewId} was not found`)
      )
    }
  } catch (error) {
    next(error)
  }
})

// POST
router.post("/:id/review", reviewValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      const { comment, rate } = req.body
      const newReview = {
        _id: uniqid(),
        comment,
        productId: req.params.id,
        rate,
        createdAt: new Date(),
        lastModified: new Date(),
      }
      const reviews = await readFile("reviews.json")
      reviews.push(newReview)
      writeToFile("reviews.json", reviews)
      res.status(201).send({ _id: newReview._id })
    } else {
      next(createHttpError(400, { errorsList: errors }))
    }
  } catch (error) {
    next(error)
  }
})

// UPDATE

router.put("/:id/review/:reviewId", async (req, res, next) => {
  try {
    const reviews = await readFile("reviews.json")
    const remainingReviews = reviews.filter(
      (review) => review._id !== req.params.reviewId
    )
    const { comment, rate, ...createdAt } = req.body
    const updatedReview = {
      ...req.body,
      _id: req.params.reviewId,
      comment,
      productId: req.params.id,
      ...createdAt,
      rate,

      lastModified: new Date(),
    }
    if (remainingReviews) {
      remainingReviews.push(updatedReview)
      await writeToFile("reviews.json", remainingReviews)
    } else {
      createHttpError(404, `the review ${req.params.reviewId} was not found`)
    }
    res.send(updatedReview)
  } catch (error) {
    next(error)
  }
})
// 5.DELETE

router.delete("/:id/review/:reviewId", async (req, res, next) => {
  try {
    const reviews = await readFile("reviews.json")
    const remainingReviews = reviews.filter(
      (review) => review._id !== req.params.reviewId
    )
    await writeToFile("authors.json", remainingReviews)
    res.status(200).send(`${req.params.reviewId} has been deleted`)
  } catch (error) {
    next(error)
  }
})

export default router
