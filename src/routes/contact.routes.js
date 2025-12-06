import {Router} from "express";
import {
    addContact,
    getContactById,
    searchContact,
    updateContact,
    deleteContact,
    deleteMultipleContacts,
    addTag,
    addMultipleTags,
    deleteTagFromContact,
    deleteMultipleTagsFromContacts,
    getTagUsageCount,
    deleteTag,
    exportContacts
} from "../controllers/contact.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import validateRequest from "../middlewares/InputValidator.middleware.js";
import { body, param, query } from "express-validator";
import { StandardValidation } from "express-validator/lib/context-items/standard-validation.js";

/**
 * @swagger
 * components:
 *   schemas:
 *     Contact:
 *       type: object
 *       required:
 *         - firstName
 *       properties:
 *         id:
 *           type: integer
 *           description: Contact's unique identifier
 *         firstName:
 *           type: string
 *           description: Contact's first name
 *         lastName:
 *           type: string
 *           description: Contact's last name
 *         email:
 *           type: string
 *           format: email
 *           description: Contact's email address
 *         phone:
 *           type: string
 *           description: Contact's phone number
 *         address:
 *           type: string
 *           description: Contact's address
 *         company:
 *           type: string
 *           description: Contact's company
 *         jobRole:
 *           type: string
 *           description: Contact's job role
 *         customFields:
 *           type: object
 *           description: Custom fields for additional contact information
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Tags associated with the contact
 *         lastContacted:
 *           type: string
 *           format: date-time
 *           description: Last contact date
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Contact creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Contact last update timestamp
 *       example:
 *         id: 1
 *         firstName: "John"
 *         lastName: "Doe"
 *         email: "john.doe@example.com"
 *         phone: "+1234567890"
 *         address: "123 Main St, City, State"
 *         company: "Acme Corp"
 *         jobRole: "Software Engineer"
 *         customFields: {"linkedin": "john-doe", "birthday": "1990-01-01"}
 *         tags: ["client", "priority"]
 *         lastContacted: "2023-12-01T10:30:00Z"
 *         createdAt: "2023-06-25T10:30:00Z"
 *         updatedAt: "2023-12-01T10:30:00Z"
 *     
 */

const router = Router();
router.use(verifyJWT);
// customField custom-validation logic
const customField_Validation = (obj)=> {
    const objSize = JSON.stringify(obj).length;
    if(objSize >10000){
        throw new Error('customField object is too large');
    }

    for(const [key, value] of Object.entries(obj)){
        if(!/^[a-zA-Z0-9_]+$/.test(key) || key.length>50){
            throw new Error(`Invalid key format: ${key}`);
        }

        if(typeof value === 'string' && value.length > 1000){
            throw new Error(`Value too long for key: ${key}`);
        }

        if(typeof value === 'function'){
            throw new Error('Function not alowed in customFields')
        }
    }

    return true;
}
// tags custom validation logic
const customTag_Validation = (tags)=>{
    if(tags && tags.length>0){
        if(!tags.every(tag => typeof tag === 'string')){
            throw new Error('All tags must be strings')
        }
        
    }
    return true;
}
/**
 * @swagger
 * /api/v1/contacts/add-contact:
 *   post:
 *     summary: Add a new contact
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContactInput'
 *     responses:
 *       200:
 *         description: Contact added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Contact successfully added."
 *       401:
 *         description: Contact already exists or unauthorized
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
// addContact
router.post("/add-contact", validateRequest(
[
    body('firstName').trim().escape().notEmpty().withMessage("firstName is required,it should be a string"),
    ...['lastName', 'address', 'company', 'jobRole','lastContacted'].map(field => body(field).optional().isString().trim().escape().withMessage(`${field} should be a string`)),

    body('email').optional().trim().escape().isEmail().withMessage("Email should be in correct format"),
    body('phone').optional().trim().escape().isMobilePhone().withMessage("Phone number should be in correct format"),
    body('customFields').optional().isObject().withMessage('CustomFields should be a valid JSON object').custom(customField_Validation),

    body('tags').optional().isArray().withMessage('tags should be an array of strings').custom(customTag_Validation),
    
    body('lastContacted').optional().trim().escape().isEmpty().isDate().withMessage('lastContacted should be a date time value')
]
),
addContact);

/**
 * @swagger
 * /api/v1/contacts/get-contact-by-id/{contactId}:
 *   get:
 *     summary: Get a contact by ID
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Contact ID
 *     responses:
 *       200:
 *         description: Contact details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Contact details found"
 *                 data:
 *                   $ref: '#/components/schemas/Contact'
 *       404:
 *         description: Contact not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
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
// getContactById
router.get("/get-contact-by-id/:contactId", validateRequest([
    param('contactId').trim().escape().isNumeric().notEmpty().withMessage('Contact Id should be a number')
]), getContactById);

// searchContact - customField filter pending

// updateContact
router.patch("/update-contact", validateRequest([
   
    body('contactId').trim().escape().isNumeric().notEmpty().withMessage("Contact Id should be a number."),
    ...['firstName','lastName', 'address', 'company', 'jobRole'].map(field => body(field).optional().isString().trim().escape().withMessage(`${field} should be a string`)),

    body('email').optional().trim().escape().isEmail().withMessage("Email should be in correct format"),

    body('phone').optional().trim().escape().isMobilePhone().withMessage("Phone number should be in correct format"),

    body('customFields').optional().isObject().withMessage('CustomFields should be a valid JSON object').custom(customField_Validation),

    body('tags').optional().isArray().escape().withMessage('tags should be an array of strings').custom(customTag_Validation),

    body('lastContacted').optional().trim().escape().isEmpty().isDate().withMessage('lastContacted should be a date time value')

]), updateContact);

/**
 * @swagger
 * /api/v1/contacts/delete-contact:
 *   delete:
 *     summary: Delete a contact
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contactId
 *             properties:
 *               contactId:
 *                 type: integer
 *                 description: Contact ID to delete
 *             example:
 *               contactId: 1
 *     responses:
 *       200:
 *         description: Contact deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Contact Successfully deleted"
 *       404:
 *         description: Contact not found or no permission
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
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
// deleteContact
router.delete("/delete-contact", validateRequest([
    body('contactId').trim().escape().isNumeric().notEmpty().withMessage("Contact Id should be a number.")
]), deleteContact);

// custom contactIds validation
const customContactIds_Validation = (ids) => {
    if(!ids.every(id => Number.isInteger(Number(id)))){
        throw new Error('All contactIds must be a number')
    }
    return true;
}

// deleteMultipleContacts
router.delete("/delete-multiple-contacts", validateRequest([
    body('contactIds').isArray({min:1}).withMessage("Contact Ids should be a non-empty Array of numbers").custom(
        customContactIds_Validation
    )
]), deleteMultipleContacts);

/**
 * @swagger
 * /api/v1/contacts/add-tag:
 *   post:
 *     summary: Add tags to a contact
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TagInput'
 *     responses:
 *       201:
 *         description: Tags added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Success! Tags added to contact"
 *                 data:
 *                   $ref: '#/components/schemas/Contact'
 *       200:
 *         description: No new tags to add
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No new tags to add. All tags are already linked to contact"
 *       404:
 *         description: Contact not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
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
// addTag
router.post("/add-tag", validateRequest([
    body('tags').isArray({min:1}).withMessage('tags should be an array of strings').custom(customTag_Validation),
    body('contactId').trim().escape().isNumeric().notEmpty().withMessage('Contact Id should be a number')
]), addTag);

/**
 * @swagger
 * /api/v1/contacts/add-multiple-tags:
 *   post:
 *     summary: Add tags to multiple contacts
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MultipleTagInput'
 *     responses:
 *       200:
 *         description: Tags added to contacts successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully added tags to [1,2,3]"
 *                 tagsAdded:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["client", "priority"]
 *                 contactCount:
 *                   type: integer
 *                   example: 3
 *       400:
 *         description: Invalid input or permission denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
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
// addMultipleTags
router.post("/add-multiple-tags", validateRequest([
    body('contactIds').isArray({min:1}).withMessage("Contact Ids should be an array with atleast one id").custom(customContactIds_Validation),
    body('tags').isArray({min:1}).withMessage("tags should be an Array with atleast one tag").custom(customTag_Validation)
]), addMultipleTags);

/**
 * @swagger
 * /api/v1/contacts/delete-tag-from-contact:
 *   delete:
 *     summary: Delete a tag from a contact
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contactId
 *               - tagName
 *             properties:
 *               contactId:
 *                 type: integer
 *                 description: Contact ID
 *               tagName:
 *                 type: string
 *                 description: Tag name to remove
 *             example:
 *               contactId: 1
 *               tagName: "client"
 *     responses:
 *       200:
 *         description: Tag removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully removed client from John"
 *       404:
 *         description: Contact or tag not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
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
// deleteTagFromContact
router.delete("/delete-tag-from-contact", validateRequest([
    body('contactId').trim().escape().isNumeric().notEmpty().withMessage('Contact ID should be an integer'),
    body('tagName').trim().escape().isString().notEmpty().withMessage('Tag Name should be a string.')
]), deleteTagFromContact);

/**
 * @swagger
 * /api/v1/contacts/delete-multiple-tags-from-contacts:
 *   delete:
 *     summary: Delete multiple tags from multiple contacts
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contactIds
 *               - tags
 *             properties:
 *               contactIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of contact IDs
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of tag names to remove
 *             example:
 *               contactIds: [1, 2, 3]
 *               tags: ["outdated", "inactive"]
 *     responses:
 *       200:
 *         description: Tags removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully removed 2 tags from 3 contacts"
 *                 deletedAssociations:
 *                   type: integer
 *                   example: 6
 *       403:
 *         description: Permission denied or not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
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
// deleteMultipleTagsFromContacts
router.delete("/delete-multiple-tags-from-contacts", validateRequest([
    body('contactIds').isArray({min: 1}).withMessage('Contact IDs should be an array').custom(customContactIds_Validation),
    body('tags').isArray({min:1}).withMessage("Tags should be an array").custom(customTag_Validation)
]), deleteMultipleTagsFromContacts);

/**
 * @swagger
 * /api/v1/contacts/get-tag-usage/{tagName}:
 *   get:
 *     summary: Get usage count for a specific tag
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tagName
 *         required: true
 *         schema:
 *           type: string
 *         description: Tag name to get usage count for
 *     responses:
 *       200:
 *         description: Tag usage information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tag usage information"
 *                 data:
 *                   $ref: '#/components/schemas/TagUsage'
 *       404:
 *         description: Tag not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
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
// getTagUsageCount
router.get("/get-tag-usage/:tagName", validateRequest([
    param('tagName').trim().escape().isString().notEmpty().withMessage('tag name is required to get usage count')
]), getTagUsageCount);

/**
 * @swagger
 * /api/v1/contacts/delete-tag:
 *   delete:
 *     summary: Delete a tag from all contacts
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tagName
 *             properties:
 *               tagName:
 *                 type: string
 *                 description: Tag name to delete completely
 *             example:
 *               tagName: "outdated"
 *     responses:
 *       200:
 *         description: Tag deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully removed tag outdated"
 *       404:
 *         description: Tag not found or no permission
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
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
// deleteTag
router.delete("/delete-tag", validateRequest([
    body('tagName').trim().escape().isString().notEmpty().withMessage('tag name is required to get usage count')
]), deleteTag);

/**
 * @swagger
 * /api/v1/contacts/export-contacts:
 *   get:
 *     summary: Export all contacts to CSV
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV file with contact data
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Content-Disposition:
 *             description: Attachment filename
 *             schema:
 *               type: string
 *               example: 'attachment; filename="contacts.csv"'
 *           Content-Type:
 *             description: Content type
 *             schema:
 *               type: string
 *               example: 'text/csv; charset=utf-8'
 *       400:
 *         description: No contacts found or permission denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
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
// exportContacts
router.get("/export-contacts", exportContacts);

export default router;