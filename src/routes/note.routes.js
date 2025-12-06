import { createNote, listNotes, getNote, updateNote, deleteNote } from "../controllers/note.controller.js";

import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import validateRequest from "../middlewares/InputValidator.middleware.js";
import { body, param,query } from "express-validator";

const router = Router();
router.use(verifyJWT);

/**
 * @swagger
 * components:
 *   schemas:
 *     Note:
 *       type: object
 *       required:
 *         - contactId
 *         - title
 *         - content
 *       properties:
 *         id:
 *           type: integer
 *           description: Note's unique identifier
 *         contactId:
 *           type: integer
 *           description: ID of the contact this note belongs to
 *         userId:
 *           type: integer
 *           description: ID of the user who created the note
 *         title:
 *           type: string
 *           description: Title of the note
 *         content:
 *           type: string
 *           description: Content of the note
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Note creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Note last update timestamp
 *       example:
 *         id: 1
 *         contactId: 5
 *         userId: 3
 *         title: "Follow-up Meeting"
 *         content: "Discussed project requirements and next steps"
 *         createdAt: "2023-12-01T10:30:00Z"
 *         updatedAt: "2023-12-01T10:30:00Z"
 *     
 *     NoteInput:
 *       type: object
 *       required:
 *         - contactId
 *         - title
 *         - content
 *       properties:
 *         contactId:
 *           type: integer
 *           description: ID of the contact this note belongs to
 *         title:
 *           type: string
 *           description: Title of the note
 *         content:
 *           type: string
 *           description: Content of the note
 *       example:
 *         contactId: 5
 *         title: "Follow-up Meeting"
 *         content: "Discussed project requirements and next steps"
 *
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message
 *       example:
 *         message: "Error description"
 */

/**
 * @swagger
 * /api/v1/notes/create-note:
 *   post:
 *     summary: Create a new note
 *     tags:
 *       - Notes
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NoteInput'
 *     responses:
 *       201:
 *         description: Note created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully added note"
 *       409:
 *         description: Note with same title already exists for this contact
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// create note 
router.post("/create-note", validateRequest([
    body('contactId').trim().notEmpty().escape().isNumeric().withMessage("ContactId can't be empty and should be a number"),
    body('title').trim().escape().notEmpty().isString().withMessage("title should be a string"),
    body('content').trim().escape().notEmpty().isString().withMessage("Content shoul be a string")
]),
createNote
);

/**
 * @swagger
 * /api/v1/notes/list-notes:
 *   get:
 *     summary: List all notes for the authenticated user
 *     tags:
 *       - Notes
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Notes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Note'
 *       401:
 *         description: No notes found or unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// listNote
router.get('/list-notes', listNotes);

/**
 * @swagger
 * /api/v1/notes/get-note:
 *   get:
 *     summary: Get notes by various filters
 *     tags:
 *       - Notes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: noteId
 *         required: false
 *         schema:
 *           type: integer
 *         description: Filter by specific note ID
 *       - in: query
 *         name: contactId
 *         required: false
 *         schema:
 *           type: integer
 *         description: Filter by contact ID to get all notes for a contact
 *       - in: query
 *         name: title
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter by note title
 *     responses:
 *       201:
 *         description: Notes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 fetchedNote:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Note'
 *                 message:
 *                   type: string
 *                   example: "successfully fetched note"
 *       401:
 *         description: No parameters provided or no notes found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// getNote
router.get('/get-note', 
    validateRequest([
        query('noteId').optional().trim().escape().notEmpty().isNumeric().withMessage("noteId should be a valid non-empty number"),

        query('contactId').optional().trim().escape().notEmpty().isNumeric().withMessage("contactId should be a non-empty number"),

        query('title').optional().trim().escape().notEmpty().isString().withMessage("Title should be a string")

    ]),
    getNote
);

/**
 * @swagger
 * /api/v1/notes/update-note:
 *   patch:
 *     summary: Update an existing note
 *     tags:
 *       - Notes
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - noteId
 *             properties:
 *               noteId:
 *                 type: integer
 *                 description: ID of the note to update
 *               title:
 *                 type: string
 *                 description: New title for the note
 *               content:
 *                 type: string
 *                 description: New content for the note
 *             example:
 *               noteId: 1
 *               title: "Updated Meeting Notes"
 *               content: "Updated content with additional details"
 *     responses:
 *       201:
 *         description: Note updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 updatedNote:
 *                   $ref: '#/components/schemas/Note'
 *                 message:
 *                   type: string
 *                   example: "Successfully update note"
 *       401:
 *         description: Note not found, unauthorized, or missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// updateNote
router.patch('/update-note', validateRequest([
    body('noteId').trim().escape().notEmpty().isNumeric().withMessage("noteId should be a valid non-empty number"),

    body('title').optional().trim().escape().notEmpty().isString().withMessage("Title should be a valid string"),

    body('content').optional().trim().escape().notEmpty().isString().withMessage("Content should be a valid string")
]),
updateNote)

/**
 * @swagger
 * /api/v1/notes/delete-note:
 *   delete:
 *     summary: Delete a note
 *     tags:
 *       - Notes
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - noteId
 *             properties:
 *               noteId:
 *                 type: integer
 *                 description: ID of the note to delete
 *             example:
 *               noteId: 1
 *     responses:
 *       201:
 *         description: Note deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully delted note"
 *       401:
 *         description: Note not found or unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// delete Note
router.delete('/delete-note', validateRequest([
    body('noteId').trim().escape().notEmpty().isNumeric().withMessage("noteId should be a valid nimber")
]), deleteNote);

export default router;
