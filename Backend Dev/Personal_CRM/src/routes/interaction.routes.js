import {
    logInteraction,
    listInteractions,
    getInteraction,
    updateInteraction,
    deleteInteraction
} from '../controllers/interaction.controller.js';
import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import validateRequest from '../middlewares/InputValidator.middleware.js';
import { body, param } from 'express-validator';


const router = Router();
router.use(verifyJWT);

// logInteraction
router.post('/log-interaction', validateRequest([
    body('contactId').trim().escape().isEmpty().isNumeric().withMessage('Contact Id should be a valid number'),

    body('type').trim().escape().isEmpty().isString().withMessage('type should be a string'),

    body('occuredAt').trim().escape().isEmpty().isDate().withMessage("occured At should be a DateTime"),

    body('notes').trim().escape().isEmpty().isString().withMessage("Notes should be a string")
]), logInteraction);

//listInteractions
router.get('/list-interactions', listInteractions);

//getInteraction
router.get('/get-interaction', validateRequest([
    param('interactionId').trim().escape().isEmpty().isNumeric().withMessage("interactionId should be a number"),

    param('contactId').trim().escape().isEmpty().isNumeric().withMessage("contactId should be a number"),

    param('occuredAt').trim().escape().isEmpty().isDate().withMessage("occured At should be a DateTime")

]), getInteraction);

//updateInteraction
// interactionId, type, occuredAt, notes
router.patch('/update-interaction', validateRequest([
    body('interactionId').trim().escape().isEmpty().isNumeric().withMessage(' interactionId should be a valid number'),


    body('type').optional().trim().escape().isEmpty().isString().withMessage('type should be a string'),

    body('occuredAt').optional().trim().escape().isEmpty().isDate().withMessage("occured At should be a DateTime"),

    body('notes').optional().trim().escape().isEmpty().isString().withMessage("Notes should be a string")

]), updateInteraction);

//deleteInteraction
router.delete('/delete-interaction', validateRequest([
    body('interactionId').trim().escape().isEmpty().isNumeric().withMessage(' interactionId should be a valid number')
]), deleteInteraction);

export default router;