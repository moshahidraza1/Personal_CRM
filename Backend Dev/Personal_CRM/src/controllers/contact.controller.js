import prisma from "../db/db.config.js";
import {Parser as CsvParser} from "json2csv";
// add a contact
const addContact = async(req, res)=>{
    
    const userId = req.user.id;
    try{
        const {firstName, lastName, email, phone, address, company, jobRole, customFields, tags} = req.body;

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
const getContactById = async(req,res)=>{
    const {contactId} = req.params;
    try {
        const contact = await prisma.contact.findFirst({
            where:{
                id: parseInt(contactId),// correct this
                userId: req.user.id
            },
            include:{
                tags:{
                    include:{
                        tag:true
                    }
                }
            }
        });
        if (!contact) {
            return res.status(404).json({
              message: "Contact not found"
            });
          }
          
          return res.status(200).json({
            message: "Contact details found",
            data: contact
          });

    } catch (error) {
        console.error(error);
    return res.status(500).json({
      message: "Error fetching contact details"
        });
    }

}

// get contacts based on input/filters with pagination - **TODO**: add filter for customFields
const searchContact = async(req,res)=>{
    const {searchTerm, tagsArray, matchType = 'any',page = 1, limit = 10,sortBy = 'updatedAt', order = 'desc'} = req.params;
    try {

        const searchFilters = searchTerm?{
            OR:[
                {firstName: { contains: searchTerm, mode: 'insensitive'}},
                {lastName:{contains: searchTerm, mode:'insensitive'}},
                {email:{contains: searchTerm, mode: 'insensitive'}},
                {phone:{contains: searchTerm}}
            ]
        }:{};

        const tagFilters = {};
        if(tagsArray && Array.isArray(tagsArray) && tagsArray.length > 0){
            if(matchType === 'any'){
                tagFilters={
                    tags:{
                        some:{
                            tag:{
                               name:{ in: tagsArray }
                            } 
                        }
                    }
                }
        }else if(matchType === 'all'){
            const contactIds = await prisma.contactTag.groupBy({
                by: ['contactId'],
                where:{
                    tag:{
                        name:{in: tagsArray}
                    },
                    contact:{
                        userId: req.user.id
                    }
                },
                having: {contactId: {_count:tagsArray.length}}
            });

            tagFilters = {
               id:{ in:contactIds.map((c) => c.contactId)}
            }
        }
    }
        const pageNumber = parseInt(page,10)|| 1;
        const pageSize = parseInt(limit,10)|| 10;
        const skip = (pageNumber-1)*pageSize;

        const [totalContacts,contacts] = await Promise.all([
            prisma.contact.count({
            where:{
                userId: req.user.id,
                ...searchFilters,
                ...tagFilters
            }}),
            prisma.contact.findMany({
            where:{
                userId: req.user.id,
                ...searchFilters,
                ...tagFilters
            },
            orderBy:{[sortBy]:order},
            skip:skip,
            take: pageSize,
            select:{
                id:true,
                firstName:true,
                lastName: true,
                email: true,
                phone: true,
                company: true,
                jobRole:true,
                tags:{
                   select:{
                    tag:{
                    select:{name:true}
                        }
                    }
                }
            }
        })
    ]
);

    const processedContacts = contacts.map(contact=>{
        const tagNames = contact.tags.map(contactTag => contactTag.tag.name);

        return{
            ...contact,
            tags: tagNames
        };
    });
        if(contacts.length == 0){
            return res.status(404).json({
                message:"Contact you are trying to search does not exists"
            });
        }
        const totalPages = Math.ceil(totalContacts/pageSize);

        return res.status(200).json({
            message: `Found ${contacts.length} matching contacts.`,
            pagination:{
                currentPage: pageNumber,
                totalContacts,
                totalPages,
                pageSize

            },
            data: processedContacts   
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message:"Something went wrong while searching contacts."
        });
    }
}

// update contact details
const updateContact = async(req,res)=>{
    const {contactId,firstName, lastName, email, phone, address, company, jobRole, customFields} = req.body;
    
    try{
        const contact = await prisma.contact.findFirst({
            where:{
                id:contactId,
                userId: req.user.id
            }
        });

        if(!contact){
            return res.status(404).json({
                message:"No contact found to update"
            });
        }
        await prisma.contact.update({
            where:{
                id:contactId,
                userId: req.user.id
            },
            data:{
                firstName,
                lastName,
                email, 
                phone, 
                address, 
                company, 
                jobRole, 
                customFields,
                updatedAt: Date.now()
            }
        });

        return res.status(200).json({
            message:"Successfully updated contact"
        });
    }catch(error){
        console.error(error);
        return res.status(500).json({
            message: "Error while updating contact details"
              });
    }


}

// delete contact
const deleteContact = async(req,res)=>{
    const {contactId} = req.body;
    try {
        const contact = await prisma.contact.findFirst({
            where:{
                id: parseInt(contactId),
                userId: req.user.id
            }
        });
        if(!contact){
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

// delete multiple contacts at a time
const deleteMultipleContacts = async(req,res)=>{
    const {contactIds} = req.body;

    if(!Array.isArray(contactIds)|| contactIds.length===0){
        return res.status(400).json({
            message:"Please provide an array or contacts to be deleted"
        });
    }
    try {
        const parsedIds = contactIds.map(id=>parseInt(id));

        const countContacts = await prisma.contact.count({
            where:{
                id:{in:parsedIds},

                userId: req.user.id
            }
        });

        if(countContacts!==parsedIds.length){
            return res.status(400).json({
                message:"One or more contact is not in your contact's list or you don't have permission to delete."
            });

        }

        const result = await prisma.contact.deleteMany({
            where:{
                id: {in:parsedIds},
                userId: req.user.id
            }
        });

        return res.status(200).json({
            message:`Successfully deleted ${result.count}`,
            count : result.count
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message:"Something went wrongf while deleting multiple contacts."
        });
    }
}

// Add tags to a contact
const addTag = async(req,res)=>{

    const {tags, contactId} = req.body;

    try {
    
        const contact = await prisma.contact.findFirst({
            where:{
                id: parseInt(contactId),// correct this
                userId: req.user.id
            },
        });
    if(!contact){
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
            id: parseInt(contactId),
            userId: req.user.id
        },
        data:{
            tags: tagsData,
            updatedAt: Date.now()
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

// add multiple tags
const addMultipleTags = async(req,res)=>{
    const {contactIds, tags} = req.body;

    if(!Array.isArray(contactIds) || contactIds.length ===0){
        return res.status(400).json({
            message:"Please provide array odf contact Ids to add tags"
        });
    }

    if(!Array.isArray(tags) || tags.lenth ===0){
        return res.status(400).json({
            message:"Pleae provide array of tags to be added to contacts."
        });
    }

    try {
        
        const parsedIds = contactIds.map(id=> parseInt(id));

        const contactCount = await prisma.contact.count({
            where:{
                id: {in:parsedIds},
                userId: req.user.id
            }
        });

        if(contactCount !== parsedIds.length){
            return res.status(400).json({
                message:"One or more contacts were not found or you don't have permission to access."
            });
        }

        // tag connection for each contact

        const operations = parsedIds.map(contactId => {
            return prisma.contact.update({
                where:{
                    id: contactId, // each contact will be processed one by one
                },
                data:{
                    tags:{  // tags is a field inside contacts
                        create: tags.map(tagName => ({  // for every tagName, nested prisma oper. to create a new entry
                            tag:{ // tag is a schema
                                connectOrCreate: { // if already exists it will not create a duplicate entry
                                    where:{
                                        name: tagName // tag entry identifier(unique)
                                    },
                                    data:{
                                        name: tagName,
                                        userId: req.user.id
                                    }
                                }
                            }
                        }))
                    },
                    updatedAt: new Date()
                }
            });
        });


        await prisma.$transaction(operations); // allSettled is not because we want atomic operation, tags are used for filtering contacts, partial updates may cause inconsistancy in db.

        return res.status(200).json({
            message: `Successfully added tags to ${parsedIds}`,
            tagsAdded: tags,
            contactCount: parsedIds.length
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong while adding tags to contacts"
        });
    }
}

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
    const {contactId, tagName} = req.body;

    try {
        const userId = req.user.id;
        // verify the contact is present in user's contactList

        const contact = await prisma.contact.findFirst({
            where:{
                id: parseInt(contactId),
                userId : userId
            },
            select:{
                id: true,
                firstName:true,
                lastName: true,
                company:true
            }
        });
        if(!contact){
            return res.status(404).json({
                message: "Contact not present in your contact list"
            });
        }
        const tagId = await getTagId(tagName,userId);

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
        const tag = await getTagId(tagName,req.user.id,{
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
        const tagExists = await getTagId(tagName,req.user.id);

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

// export contact details of a user
const exportContacts = async(req,res)=>{
    try {   
    const contacts = await prisma.contact.findMany({
        where:{
            userId: req.user.id
        },
        select:{
            id: true,
        firstName: true, 
        lastName: true, 
        email: true, 
        phone: true, 
        address: true, 
        company: true, 
        jobRole: true
        }
    });
    if(contacts.length===0){
        return res.status(400).json({
            message: "You do not have contacts in your contact list or you don't have permission to access contacts"
        });
    }
    const contactFields = [
    {label: 'ID', value:'id'},
    {label: 'FirstName', value: 'firstName'}, 
    {label: 'LastName', value: 'lastName'}, 
    {label: 'Email', value: 'email'}, 
    {label: 'Phone', value: 'phone'}, 
    {label: 'Address', value: 'address'}, 
    {label: 'Company', value: 'company'}, 
    {label: 'JobRole', value: 'jobRole'}
];
    

    const json2csv = new CsvParser({contactFields}); // organizes columns in csv file with respect to contactFields
    const csvData = json2csv.parse(contacts); // extract values from contacts array in accordance to contactFields columns and store in csvData

    res.setHeader('Content-Type', 'text/csv; charset=utf-8'); //utf-8 supports different languages and prevent characters from appearing as "�" or "?" in exported files
    res.setHeader('Content-Disposition','attachment; filename="contacts.csv"');
    res.status(200).send(csvData);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message:"Something went wrong while exporting contact data."
        });
        }   

}


export {
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
}



/* Notes for contacts controller: 
Preemium feature ->  
Export/Import: [*]Export contacts to CSV/JSON
[]Import contacts from external sources    
*/