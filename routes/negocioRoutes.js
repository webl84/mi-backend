const express = require('express');
const router = express.Router();
const negocioController = require('../controllers/negocioController');

router.get('/negocios', negocioController.getTodosLosNegocios);

module.exports = router;

