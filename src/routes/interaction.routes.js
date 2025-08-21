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
import { body, param, query } from 'express-validator';


const router = Router();
router.use(verifyJWT);

// logInteraction
router.post('/log-interaction', validateRequest([
    body('contactId').trim().escape().notEmpty().isNumeric().withMessage('Contact Id should be a valid number'),

    body('type').trim().escape().notEmpty().isString().withMessage('type should be a string'),

    body('occuredAt').trim().escape().notEmpty().isISO8601().withMessage("occured At should be a DateTime"),

    body('notes').trim().escape().notEmpty().isString().withMessage("Notes should be a string")
]), logInteraction);

//listInteractions
router.get('/list-interactions', listInteractions);

//getInteraction
router.get('/get-interaction', validateRequest([
    query('interactionId').optional().trim().escape().notEmpty().isNumeric().withMessage("interactionId should be a number"),

    query('contactId').optional().trim().escape().notEmpty().isNumeric().withMessage("contactId should be a number"),

    query('occuredAt').optional().trim().escape().notEmpty().isISO8601().withMessage("occured At should be a DateTime")

]), getInteraction);

//updateInteraction
// interactionId, type, occuredAt, notes
router.patch('/update-interaction', validateRequest([
    body('interactionId').trim().escape().notEmpty().isNumeric().withMessage(' interactionId should be a valid number'),


    body('type').optional().trim().escape().notEmpty().isString().withMessage('type should be a string'),

    body('occuredAt').optional().trim().escape().notEmpty().isISO8601().withMessage("occured At should be a DateTime"),

    body('notes').optional().trim().escape().notEmpty().isString().withMessage("Notes should be a string")

]), updateInteraction);

//deleteInteraction
router.delete('/delete-interaction', validateRequest([
    body('interactionId').trim().escape().notEmpty().isNumeric().withMessage(' interactionId should be a valid number')
]), deleteInteraction);

export default router;