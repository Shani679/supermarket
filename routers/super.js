const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const mongoMiddlewares = require('../dal/mongo');
const cartMiddlwares = require('../dal/cartMiddlwares');
const PRODUCTS = '/products';

const createSuccessResponse = data => ({data, success: true});
const getResponseMiddleware = (req, res) => res.status(200).json(createSuccessResponse(req.data));
const putAndPatchResponseMiddleware = (req, res) => res.status(201).json(createSuccessResponse(req.data));
const deleteResponseMiddleware = (req, res) => res.sendStatus(204);

router.get('/dates', mongoMiddlewares.fetchDeliveryDates, getResponseMiddleware);

router.get(PRODUCTS + '/id/:id', mongoMiddlewares.fetchProductsByCategory, getResponseMiddleware);

router.get(PRODUCTS + '/name/:name', mongoMiddlewares.fetchProductsByName, getResponseMiddleware);

router.delete('/:id', cartMiddlwares.removeProductFromCart, cartMiddlwares.calTotalPrice, putAndPatchResponseMiddleware);

router.patch('/cart', cartMiddlwares.updateCart, cartMiddlwares.calTotalPrice, putAndPatchResponseMiddleware);

router.put('/order', mongoMiddlewares.makeOrder, cartMiddlwares.destroyCart, putAndPatchResponseMiddleware);

router.get('/user/orders', mongoMiddlewares.fetchAllUserOrders, getResponseMiddleware);

router.delete('/', cartMiddlwares.destroyCart, putAndPatchResponseMiddleware);

router.put('/', mongoMiddlewares.createNewProduct, putAndPatchResponseMiddleware);

router.patch('/update', mongoMiddlewares.updateProduct, putAndPatchResponseMiddleware);

router.put('/category', mongoMiddlewares.createCategory, putAndPatchResponseMiddleware);

router.get('/categories', mongoMiddlewares.fetchAllCategories, getResponseMiddleware);

router.delete('/:pid/:cid', mongoMiddlewares.deleteProduct, putAndPatchResponseMiddleware);

router.get('/receipt', cartMiddlwares.cartOrlastOrder, getResponseMiddleware);

router.post('/upload', (req, res) => {
  if (!req.files)
    return res.status(400).send(process.env.UPLOAD_ERROR);
  const sampleFile = req.files.sampleFile;
  fs.writeFile(path.join(__dirname, `../public/upload/`, sampleFile.name), sampleFile.data, (err) => {
    err ? res.json({err}) : res.json({success: true, path: 'upload/' + sampleFile.name})
  });
});


module.exports = router;