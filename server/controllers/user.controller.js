/**
 * User Controller
 * Manages: addresses, contacts (family/friends), favorites, FCM token
 */

const User = require('../models/User');
const { createSuccess, createError } = require('../utils/response');

// ─── ADDRESSES ────────────────────────────────────────────────────────────────

// @route  GET /api/users/addresses
const getAddresses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('addresses');
    res.status(200).json(createSuccess('Addresses fetched', { addresses: user.addresses }));
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/users/addresses
const addAddress = async (req, res, next) => {
  try {
    const { label, fullAddress, city, state, pincode, landmark, isDefault } = req.body;

    const user = await User.findById(req.user._id);

    // If this is set as default, unset all others
    if (isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    // If first address, auto set as default
    const shouldBeDefault = isDefault || user.addresses.length === 0;

    user.addresses.push({ label, fullAddress, city, state, pincode, landmark, isDefault: shouldBeDefault });
    await user.save();

    res.status(201).json(createSuccess('Address added', { addresses: user.addresses }));
  } catch (error) {
    next(error);
  }
};

// @route  PUT /api/users/addresses/:addressId
const updateAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(req.params.addressId);

    if (!addr) {
      return res.status(404).json(createError('Address not found', 404));
    }

    const { label, fullAddress, city, state, pincode, landmark, isDefault } = req.body;

    if (isDefault) user.addresses.forEach((a) => (a.isDefault = false));

    Object.assign(addr, { label, fullAddress, city, state, pincode, landmark, isDefault });
    await user.save();

    res.status(200).json(createSuccess('Address updated', { addresses: user.addresses }));
  } catch (error) {
    next(error);
  }
};

// @route  DELETE /api/users/addresses/:addressId
const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter(
      (a) => a._id.toString() !== req.params.addressId
    );
    await user.save();

    res.status(200).json(createSuccess('Address removed', { addresses: user.addresses }));
  } catch (error) {
    next(error);
  }
};

// ─── CONTACTS (Family & Friends) ─────────────────────────────────────────────

// @route  GET /api/users/contacts
const getContacts = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('contacts');
    res.status(200).json(createSuccess('Contacts fetched', { contacts: user.contacts }));
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/users/contacts
const addContact = async (req, res, next) => {
  try {
    const { name, phone, relationship, address, city } = req.body;
    const user = await User.findById(req.user._id);
    user.contacts.push({ name, phone, relationship, address, city });
    await user.save();
    res.status(201).json(createSuccess('Contact added', { contacts: user.contacts }));
  } catch (error) {
    next(error);
  }
};

// @route  PUT /api/users/contacts/:contactId
const updateContact = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const contact = user.contacts.id(req.params.contactId);
    if (!contact) return res.status(404).json(createError('Contact not found', 404));
    Object.assign(contact, req.body);
    await user.save();
    res.status(200).json(createSuccess('Contact updated', { contacts: user.contacts }));
  } catch (error) {
    next(error);
  }
};

// @route  DELETE /api/users/contacts/:contactId
const deleteContact = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.contacts = user.contacts.filter(
      (c) => c._id.toString() !== req.params.contactId
    );
    await user.save();
    res.status(200).json(createSuccess('Contact removed', { contacts: user.contacts }));
  } catch (error) {
    next(error);
  }
};

// ─── FCM TOKEN ────────────────────────────────────────────────────────────────

// @route  PUT /api/users/fcm-token
const updateFcmToken = async (req, res, next) => {
  try {
    const { fcmToken } = req.body;
    await User.findByIdAndUpdate(req.user._id, { fcmToken });
    res.status(200).json(createSuccess('FCM token updated'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAddresses, addAddress, updateAddress, deleteAddress,
  getContacts, addContact, updateContact, deleteContact,
  updateFcmToken,
};
