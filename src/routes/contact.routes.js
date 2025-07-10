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

// addTag
router.post("/add-tag", validateRequest([
    body('tags').isArray({min:1}).withMessage('tags should be an array of strings').custom(customTag_Validation),
    body('contactId').trim().escape().isNumeric().notEmpty().withMessage('Contact Id should be a number')
]), addTag);

// addMultipleTags
router.post("/add-multiple-tags", validateRequest([
    body('contactIds').isArray({min:1}).withMessage("Contact Ids should be an array with atleast one id").custom(customContactIds_Validation),
    body('tags').isArray({min:1}).withMessage("tags should be an Array with atleast one tag").custom(customTag_Validation)
]), addMultipleTags);

// deleteTagFromContact
router.delete("/delete-tag-from-contact", validateRequest([
    body('contactId').trim().escape().isNumeric().notEmpty().withMessage('Contact ID should be an integer'),
    body('tagName').trim().escape().isString().notEmpty().withMessage('Tag Name should be a string.')
]), deleteTagFromContact);

// deleteMultipleTagsFromContacts
router.delete("/delete-multiple-tags-from-contacts", validateRequest([
    body('contactIds').isArray({min: 1}).withMessage('Contact IDs should be an array').custom(customContactIds_Validation),
    body('tags').isArray({min:1}).withMessage("Tags should be an array").custom(customTag_Validation)
]), deleteMultipleTagsFromContacts);

// getTagUsageCount
router.get("/get-tag-usage/:tagName", validateRequest([
    param('tagName').trim().escape().isString().notEmpty().withMessage('tag name is required to get usage count')
]), getTagUsageCount);

// deleteTag
router.delete("/delete-tag", validateRequest([
    body('tagName').trim().escape().isString().notEmpty().withMessage('tag name is required to get usage count')
]), deleteTag);

// exportContacts
router.get("/export-contacts", exportContacts);

export default router;