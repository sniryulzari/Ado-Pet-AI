const express = require("express");
const router = express.Router();
const AdminController = require("../Controllers/AdminController");
const { upload, uploadToCloudinary } = require("../Middleware/ImagesMiddleware");
const { isAdmin } = require("../Middleware/AdminMiddleWare");
const { Auth } = require("../Middleware/AuthMiddleWare");

router.post('/add', Auth, isAdmin, upload.single('petImage'), uploadToCloudinary, AdminController.addPet);
router.get('/allusers', Auth, isAdmin, AdminController.getAllUsers);
router.get('/all', Auth, isAdmin, AdminController.getAllPets);
router.get('/stats', Auth, isAdmin, AdminController.getStats);
router.get('/newsletter-subscribers', Auth, isAdmin, AdminController.getNewsletterSubscribers);
router.delete('/newsletter-subscribers/:email', Auth, isAdmin, AdminController.deleteNewsletterSubscriber);
router.get('/export/pets',  Auth, isAdmin, AdminController.exportPetsCSV);
router.get('/export/users', Auth, isAdmin, AdminController.exportUsersCSV);
router.put('/editpet', Auth, isAdmin, upload.single('petImage'), uploadToCloudinary, AdminController.editPet);
router.get("/:petId", Auth, isAdmin, AdminController.getPetById);
router.delete('/:petId', Auth, isAdmin, AdminController.deletePet);

module.exports = router;

