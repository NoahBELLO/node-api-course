const express = require('express');
const router = express.Router();
const controller = require('../controllers/livresController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { livreCreateSchema, livreUpdateSchema } = require('../validators/livreValidator');

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', authenticate, validate(livreCreateSchema), controller.create);
router.put('/:id', authenticate, validate(livreUpdateSchema), controller.update);
router.delete('/:id', authenticate, authorize('admin'), controller.destroy);
router.post('/:id/emprunter', authenticate, controller.emprunter);
router.post('/:id/retourner', authenticate, controller.retourner);

module.exports = router;
