import prisma from "../db/db.config";

/*
id Int @id @default(autoincrement())
   contactId Int
   userId Int
   type String
   occuredAt DateTime
   notes String? @db.Text()
   createdAt DateTime @default(now())
*/

// log interaction
const logInteraction = async(req,res)=>{
    const {contactId, type, occuredAt, notes } = req.body;
    const userId = req.user.id;
    try {
        const isContact = await prisma.contact.findUnique({
            where:{
                userId
            }
        });
        if(!isContact){
            return res.status(401).json({
                Message: `Could not find contact with id : ${userId}`
            });
        }

        const interaction = await prisma.interaction.create({
           data: {
            contactId, type, occuredAt, notes
           }
        });

        return res.status(200).json({
            Message: "Successfully added interaction log"
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong while logging interaction"
        });
    }
}

// list interaction
const listInteractions = async(req,res)=>{
    userId = req.user.id
    try {
        const items = await prisma.interaction.findMany({
            where:{
                userId
            },
            orderBy: {occuredAt: "desc"}
        });
        if(!items || items.length == 0){
            return res.status(401).json({
                message: "No interactions logged" 
            });
        }
        return res.status(201).json({
            items,
            message: `Found ${items.length} interactions`
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong while fetching interactions"
        });
    }
}

// get ineraction
const getInteraction = async(req,res)=>{
    const {interactionId, contactId, occuredAt} = req.params;
    if(!interactionId && !contactId && !occuredAt){
        return res.status(401).json({
            message: "No parameter recieved to filter interactions"
        });
    }
    const userId = req.user.id;
  
    try {
        const filters = {};
        if(interactionId) filters.id = interactionId;
        if(contactId) filters.contactId = contactId;
        if(occuredAt) filters.occuredAt = occuredAt;

        const interactions = await prisma.interaction.findMany({
            where: {
                filters,
                userId
            }
        });
        if(!interactions || interactions.length== 0){
            return res.status(401).json({
                message: "Could not find any interaction with provided filters"
            });
        }
        return res.status(200).json({
            message: `Found ${interactions.length} interaction logs with provided filters`
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong while filtering interaction logs"
        });
    }
}

// edit interaction
const updateInteraction = async(req,res)=>{
    const {interactionId, type, occuredAt, notes} = req.body;

    if(!type && !occuredAt && !notes){
        return res.status(401).json({
            message: "No data provided to update interaction log"
        });
    }
    const userId = req.user.id;

    try {
        
        const interaction = await prisma.interaction.findUnique({
            where:{
                id: interactionId,
                userId
            }
        });
        if(!interaction){
            return res.status(404).json({
                message: `No interaction found with id : ${interactionId}`
            });
        }

        await prisma.interaction.update({
            where: {
                id: interactionId,
                userId
            },
            data: {
                type, occuredAt, notes
            }
        });

        res.status(200).json({
            message: "Successfully updated interacton log"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong while updating interaction log"
        });
    }
}

// delete interaction
const deleteInteraction = async(req, res)=>{
    const {interactionId} = req.body;
    try {
        userId = req.user.id;
        const interaction = await prisma.interaction.findUnique({
            where:{
                id: interactionId,
                userId
            }
        });
        if(!interaction){
            return res.status(404).json({
                message: "No interaction log found to be deleted"
            });
        }

        await prisma.interaction.delete({
            where:{
                id: interactionId,
                userId
            }
        });

        res.status(200).json({
            message: "Successfully deleted interaction"
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message:"Something went wrong while deleting interaction log"
        });
    }
}

export{
    logInteraction,
    listInteractions,
    getInteraction,
    updateInteraction,
    deleteInteraction
}