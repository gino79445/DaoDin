const express = require('express');
const router = express.Router();
const authorization = require('../utils/authorization').authorization;
const controller = require('../Controller/user');
const { upload } = require('../utils/multer');

router.use(express.json());

router.post('/signup', controller.signup);
router.post('/signin', controller.signin);

router.use(authorization);

router.put('/profile', controller.updateProfile);
router.put('/profile/picture', upload.single('picture'), controller.updateProfilePicture);
router.get('/profile', controller.getProfile);

module.exports = router;