/**
 * User Routes - Addresses, Contacts, FCM Token
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getAddresses, addAddress, updateAddress, deleteAddress,
  getContacts, addContact, updateContact, deleteContact,
  updateFcmToken,
} = require('../controllers/user.controller');

// All routes protected
router.use(protect);

// Addresses
router.route('/addresses')
  .get(getAddresses)
  .post(addAddress);

router.route('/addresses/:addressId')
  .put(updateAddress)
  .delete(deleteAddress);

// Contacts (Family & Friends)
router.route('/contacts')
  .get(getContacts)
  .post(addContact);

router.route('/contacts/:contactId')
  .put(updateContact)
  .delete(deleteContact);

// FCM Token
router.put('/fcm-token', updateFcmToken);

module.exports = router;
