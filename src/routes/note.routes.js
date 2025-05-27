import { createNote, listNotes, getNote, updateNote, deleteNote } from "../controllers/note.controller.js";

import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import validateRequest from "../middlewares/InputValidator.middleware.js";
import { body, param } from "express-validator";

const router = Router();
router.use(verifyJWT);
// create note
router.post("/create-note", validateRequest([
    body('contactId').trim().isEmpty().escape().isNumeric().withMessage("ContactId can't be empty and should be a number"),
    body('title').trim().escape().isEmpty().isString().withMessage("title should be a string"),
    body('content').trim().escape().isEmpty().isString().withMessage("Content shoul be a string")
]),
createNote
);

// listNote
router.get('/list-notes', listNotes);

// getNote
router.get('/get-note', 
    validateRequest([
        param('noteId').optional().trim().escape().isEmpty().isNumeric().withMessage("noteId should be a valid non-empty number"),

        param('contactId').optional().trim().escape().isEmpty().isNumeric().withMessage("contactId should be a non-empty number"),

        param('title').optional().trim().escape().isEmpty().isString().withMessage("Title should be a string")

    ]),
    getNote
);

// updateNote
router.patch('/update-note', validateRequest([
    body('noteId').trim().escape().isEmpty().isNumeric().withMessage("noteId should be a valid non-empty number"),

    body('title').optional().trim().escape().isEmpty().isString().withMessage("Title should be a valid string"),

    body('content').optional().trim().escape().isEmpty().isString().withMessage("Content should be a valid string")
]),
updateNote)

// delete Note
router.delete('/delete-note', validateRequest([
    body('noteId').trim().escape().isEmpty().isNumeric().withMessage("noteId should be a valid nimber")
]), deleteNote);

export default router;
