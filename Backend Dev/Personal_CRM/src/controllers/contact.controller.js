import prisma from "../db/db.config.js";

// add a contact
const addContact = async(req, res)=>{
    
    const userId = req.user.id;
    try{
        const {firstName, lastName, email, phone, address, company, jobRole, notes, customFields, tags} = req.body;

    const existingContact = await prisma.contact.findFirst({
        where:{
            userId,
            OR:[
                {email:email||undefined},
                {phone:phone||undefined}
            ]
        }
    });
    if(existingContact){
        return res.status(401).json({
            message:"Contact already present"
        });
    }
    let tagsData = {};
    if(tags && Array.isArray(tags) && tags.length > 0){
        tagsData = {
            create: tags.map(tagName => ({
                tag:{
                    connectOrCreate:{
                        where:{
                            name: tagName
                        },
                        create:{
                            name: tagName
                        }
                    }
                }
            }))
        };
    }
    await prisma.contact.create({
        data:{
            firstName,
            lastName,
            email,
            phone,
            address,
            company,
            jobRole,
            notes,
            customFields,
            user:{
                connect:{
                    id: userId
                }
            },
            tags: tagsData
        }

    });

        return res.status(200).json({
            message: "Contact successfully added."
        })
    }catch(error){
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong while adding contact"
        })
    }

}

// get contact id
const getContactId = async(contactName,userId)=>{

    try {
        const contact = await prisma.contact.findFirst({
            where:{
                name: contactName,
                userId
            }
        });
        return contact;

    } catch (error) {
        console.error(error);
        throw new Error("Failed to find contact")
    }

}

// get contact details
const getContact = async(req,res)=>{
    const {contactName} = req.body;
    try {
        const contactExists = getContactId(contactName,req.user.id);
        if(!contactExists){
            return res.status(404).json({
                message:"Contact you are trying to search does not exists"
            });
        }

        return res.status(200).json({
            message:"Contact details are found",
            data: contactExists
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message:"Something went wrong while fetching contact details"
        });
    }
}

// update contact details

// Add tags to a contact
const addTag = async(req,res)=>{

    const {tags, contactName} = req.body;

    try {
    
    const contactExists = getContactId(contactName,req.user.id);
    if(!contactExists){
        return res.status(404).json({
            message:"Contact not found in user contacts"
        })
    }

    let tagsData = {};
    if(tags && Array.isArray(tags) && tags.length > 0){
        tagsData = {
            create: tags.map(tagName => ({
                tag:{
                    connectOrCreate:{
                        where:{
                            name: tagName
                        },
                        create:{
                            name: tagName
                        }
                    }
                }
            }))
        };
    }

    const updatedContactTag = await prisma.contact.update({
        where:{
            id: parseInt(contactId)
        },
        data:{
            tags: tagsData,
            updatedAt: new Date.now()
            }
        }
    );
    return res.status(201).json({
        message: "Success! Tags added to contact",
        data: updatedContactTag
    });
} catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong while adding tags to contact"
        });
}

}

// get all contacts(maybe add pagination)


//search and filter contacts

// add contact notes
// 

// get tagId using tagName
const getTagId = async(tagName, userId,options={})=>{
    try {
        const tag =  await prisma.tag.findFirst({
            where:{
                name: tagName,
                userId
            },
            ...options
        });
        return tag;
    } catch (error) {
        console.error(error);
        throw new Error("Failed to find tag");

    }
}

// delete tag from a single contact
const deleteTagFromContact = async(req, res)=>{
    const {contactName, tagName} = req.body;

    try {
        const userId = req.user.id;
        const contactId = getContactId(contactName,userId);
        const tagId = getTagId(tagName,userId);

        const isContactTag = await prisma.contactTag.findFirst({
            where:{
                tagId,
                contactId
            }
        });
        
        if(!isContactTag){
            return res.status(404).json({
                message:"No contact found with this tag, Check contact name or tag name"
            });
        }
        await prisma.contactTag.delete({
            where:{
                id: isContactTag.id
            }
        });

        return res.status(200).json({
            message:`Successfully removed ${tagName} from ${contactName}`
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message:"Something went wrong while removing tag from contact"
        });
    }
}

// get Tag usage count
const getTagUsageCount = async(req,res)=>{
    const {tagName} = req.body;

    try {
        const tag = getTagId(tagName,req.user.id,{
            include:{
                _count:{
                    select:{
                        contacts:true
                    }
                }
            }
        });
        if(!tag){
            return res.status(404).json({
                message:"Tag not found"
            });
        }
        return res.status(200).json({
            message: "Tag usage information",
            data:{
                tagName,
                contactCount: tag._count.contacts
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message:"Something went wrong while retrieving tag usage information."
        })
    }
}

// delete tag from a all contacts
const deleteTag = async(req,res)=>{
    const {tagName} = req.body;
    try {
        const tagExists = getTagId(tagName,req.user.id);

        if(!tagExists){
            return res.status(404).json({
                message:"Tag is not found or you don't have permission to delete it. "
            });
        }
        const tagId = tagExists.id;
        await prisma.tag.deleteMany({
            where:{
                id: tagId
            }
        });
        res.status(200).json({
            message:`Successfully removed tag ${tagName}`
        })
    } catch (error) {
        console.error(error).json({
            message:"Something went wrong while deleting tag"
        })
    }
}

// delete contact
const deleteContact = async(req,res)=>{
    const {contactId} = req.body;
    try {
        const contactExists = await prisma.contact.findFirst({
            where:{
                id: parseInt(contactId),
                userId: req.user.id
            }
        });
        if(!contactExists){
            return res.status(404).json({
                message:"Contact not found or you don't have permission to delete"
            });
        }
        await prisma.contact.delete({
            where:{
                id: parseInt(contactId)
            }
        });
        return res.status(200).json({
            message:"Contact Successfully deleted"
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message:"Something went wrong while deleting contact"
        });
    }
}

export {
    addContact
}