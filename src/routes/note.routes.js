import { createNote, listNotes, getNote, updateNote, deleteNote } from "../controllers/note.controller.js";

import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import validateRequest from "../middlewares/InputValidator.middleware.js";
import { body, param,query } from "express-validator";

const router = Router();
router.use(verifyJWT);
// create note
router.post("/create-note", validateRequest([
    body('contactId').trim().notEmpty().escape().isNumeric().withMessage("ContactId can't be empty and should be a number"),
    body('title').trim().escape().notEmpty().isString().withMessage("title should be a string"),
    body('content').trim().escape().notEmpty().isString().withMessage("Content shoul be a string")
]),
createNote
);

// listNote
router.get('/list-notes', listNotes);

// getNote
router.get('/get-note', 
    validateRequest([
        query('noteId').optional().trim().escape().notEmpty().isNumeric().withMessage("noteId should be a valid non-empty number"),

        query('contactId').optional().trim().escape().notEmpty().isNumeric().withMessage("contactId should be a non-empty number"),

        query('title').optional().trim().escape().notEmpty().isString().withMessage("Title should be a string")

    ]),
    getNote
);

// updateNote
router.patch('/update-note', validateRequest([
    body('noteId').trim().escape().notEmpty().isNumeric().withMessage("noteId should be a valid non-empty number"),

    body('title').optional().trim().escape().notEmpty().isString().withMessage("Title should be a valid string"),

    body('content').optional().trim().escape().notEmpty().isString().withMessage("Content should be a valid string")
]),
updateNote)

// delete Note
router.delete('/delete-note', validateRequest([
    body('noteId').trim().escape().notEmpty().isNumeric().withMessage("noteId should be a valid nimber")
]), deleteNote);

export default router;
