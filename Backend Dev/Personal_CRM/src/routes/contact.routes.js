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
    getTagUsageCount,
    deleteTag,
    exportContacts
} from "../controllers/contact.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import validateRequest from "../middlewares/InputValidator.middleware.js";
import { body, param, query } from "express-validator";

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
        else{
            tags.forEach(element => {
                element.escape();
            });
        }
    }
    return true;
}
// addContact
router.post("/add-contact", validateRequest(
[
    body('firstName').trim().escape().notEmpty().withMessage("firstName is required,it should be a string"),
    ...['lastName', 'address', 'company', 'jobRole'].map(field => body(field).optional().trim().escape().withMessage(`${field} should be a string`)),

    body('email').optional().trim().escape().isEmail().withMessage("Email should be in correct format"),
    body('phone').optional().trim().escape().isMobilePhone().withMessage("Phone number should be in correct format"),
    body('customFields').optional().isObject().withMessage('CustomFields should be a valid JSON object').custom(customField_Validation),

    body('tags').optional().isArray().withMessage('tags should be an array of strings').custom(customTag_Validation)

]
),
addContact);

// getContactById
router.get("/get-contact-by-id", validateRequest([
    param('contactId').trim().escape().isNumeric().notEmpty().withMessage('Contact Id should be a number')
]), getContactById);

// searchContact - customField filter pending

// updateContact
router.patch("/update-contact", validateRequest([
    // contactId,firstName, lastName, email, phone, address, company, jobRole, customFields

    body('contactId').trim().escape().isNumeric().notEmpty().withMessage("Contact Id should be a number."),
    ...['firstName','lastName', 'address', 'company', 'jobRole'].map(field => body(field).optional().trim().escape().withMessage(`${field} should be a string`)),

    body('email').optional().trim().escape().isEmail().withMessage("Email should be in correct format"),

    body('phone').optional().trim().escape().isMobilePhone().withMessage("Phone number should be in correct format"),

    body('customFields').optional().isObject().withMessage('CustomFields should be a valid JSON object').custom(customField_Validation),

    body('tags').optional().isArray().withMessage('tags should be an array of strings').custom(customTag_Validation)

]), updateContact);

// deleteContact
// deleteMultipleContacts
// addTag
// addMultipleTags
// deleteTagFromContact
// getTagUsageCount
// deleteTag
// exportContacts

export default router;