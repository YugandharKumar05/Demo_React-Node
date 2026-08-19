const express = require('express');
const { createUser, bulkCreateUsers, getUsers, getDeletedUsers, updateUser, deleteUser } = require('../controllers/user.controller');

const router = express.Router();

router.post('/', createUser);
router.post('/bulk', bulkCreateUsers);
router.get('/', getUsers);
router.get('/deleted', getDeletedUsers);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
