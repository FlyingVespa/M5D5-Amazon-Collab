import express from "express"
import fs from "fs"
import path, { dirname, join } from "path"
import { fileURLToPath } from "url"
import uniqid from "uniqid"
import multer from "multer"

const fileName = fileURLToPath(import.meta.url)
const directoryName = dirname(fileName)
const productsFilePath = path.join(directoryName, "products.json")
const router = express.Router()

//get all products
router.get('/', async (req, res, next) => {
    try {
        const fileAsBuffer = fs.readFileSync(productsFilePath)
        const fileAsString = fileAsBuffer.toString()
        const fileAsJson = JSON.parse(fileAsString)
        if (req.query.category) {
            console.log(req.query)
            const product = fileAsJson.filter(product => product.category === req.query.category)
            res.send(product)
        } else {
            res.send(fileAsJson)
        }
    } catch (error) {
        console.log(error)
        res.send(500).send({ message: error.message })
    }
})

//get single product
router.get('/:id', async (req, res, next) => {
    try {
        const fileAsBuffer = fs.readFileSync(productsFilePath)
        const fileAsString = fileAsBuffer.toString()
        const fileAsJson = JSON.parse(fileAsString)
        const product = fileAsJson.find(product => product.id === req.params.id)
        console.log(fileAsJson)
        if (!product) {
            res.sendStatus(404).send({ message: `product with ${req.params.id} not found!` })
        } else {
            res.send(product)
        }
    } catch (error) {
        res.sendStatus(500).send({ message: error.message })
    }
})

//create product
router.post('/', async (req, res, next) => {
    try {
        const { productName, description, brand, price, category } = req.body
        const product = {
            id: uniqid(),
            productName,
            description,
            brand,
            price,
            category,
            createdAt: new Date(),
            updatedAt: new Date()
        }
        const fileAsBuffer = fs.readFileSync(productsFilePath)
        const fileAsString = fileAsBuffer.toString()
        const fileAsJson = JSON.parse(fileAsString)
        fileAsJson.push(product)
        fs.writeFileSync(productsFilePath, JSON.stringify(fileAsJson))
        res.send(product)

    } catch (error) {
        console.log(error)
        res.send(500).send({ message: error.message })
    }
})

router.post('/:id/upload', async (req, res, next) => {
    //     const fileAsBuffer = fs.readFileSync(productsFilePath)
    //     const fileAsString = fileAsBuffer.toString()
    //     const fileAsJson = JSON.parse(fileAsString)
    //     const product = fileAsJson.find(product => product.id === req.params.id)
})

//ammend product
router.put('/:id', async (req, res, next) => {
    try {
        const fileAsBuffer = fs.readFileSync(productsFilePath)
        const fileAsString = fileAsBuffer.toString()
        let fileAsJson = JSON.parse(fileAsString)
        const productIndex = fileAsJson.findIndex(product => product.id.toString() === req.params.id)
        if (!productIndex == -1) {
            res.sendStatus(404).send({ message: `product with ${req.params.id} not found!` })
        }
        const previousProductData = fileAsJson[productIndex]
        console.log(previousProductData)
        const changedProduct = { ...previousProductData, ...req.body, updatedAt: new Date(), id: req.params.id }
        fileAsJson[productIndex] = changedProduct
        fs.writeFileSync(productsFilePath, JSON.stringify(fileAsJson))
        res.send(changedProduct)
    } catch (error) {
        res.sendStatus(500).send({ message: error.message })
    }
})

//delete product
router.delete('/:id', async (req, res, next) => {
    try {
        const fileAsBuffer = fs.readFileSync(productsFilePath)
        const fileAsString = fileAsBuffer.toString()
        let fileAsJson = JSON.parse(fileAsString)
        const product = fileAsJson.find(product => product.id.toString() === req.params.id)
        if (!product) {
            res.sendStatus(404).send({ message: "product with ${req.params.id} not found!" })
        }
        fileAsJson = fileAsJson.filter((product) => product.id.toString() !== req.params.id)
        fs.writeFileSync(productsFilePath, JSON.stringify(fileAsJson))
        res.sendStatus(204).send({ message: "Deleted" })
    } catch (error) {
        res.sendStatus(500).send({ message: error.message })
    }
})

export default router