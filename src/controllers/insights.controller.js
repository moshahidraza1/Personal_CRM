import prisma from "../db/db.config.js";

// recently contacted
const recentlyContacted = async(req, res)=>{
    const limit = parseInt(req.param.limit, 10) || 10;

    try {
        const contacts = await prisma.contact.findMany({
            where:{
                userId: req.user.id,
                lastContacted: {not:null}
            },
            orderBy: {lastContacted: "desc"},
            take :parseInt(limit),
            select:{
                id:true,
                firstName: true,
                lastName:true,
                company: true,
                jobRole: true
            }
        });

        return res.status(200).json({
            data: contacts
        });


    } catch (error) {
        return res.status(500).json({
            message: "Something went wrong while fetching recently contacted"
        });
    }
}

// stale contacts
const staleContacts = async(req,res)=>{
    const days = (req.params.days,10) || 30;
    const cutoff = new Date(Date.now() - days*24*60*60*1000);


    try {
        // * lt -> less than *//
        const stale = await prisma.contact.findMany({
            where:{
                userId: req.user.id,
                OR:[
                    {lastContacted:{lt: cutoff}},
                    {lastContacted: null}
                ]
            },
            select:{
                id:true,
                firstName:true,
                lastName:true,
                company:true,
                jobRole: true,
                lastContacted: true
            }
        });

        return res.status(200).json({
            data: stale
        });
    } catch (error) {
        return res.status(500).json({
            message: "Something went wrong while fetching stale contacts"
        });

    }
}

// contact summary
const contactSummary = async(req, res)=>{
    const contactId = Number(req.params.contactId);

    try {
        const summary = await prisma.interaction.groupBy({
            by: ['type'],
            where:{
                userId: req.user.id,
                contactId
            },
            _count:{_all:true}
        });

        const result = summary.map(item=>({
            type: item.type,
            total_interactions: item._count._all
        }));
        return res.json({
            data: result
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong while summarizing contact"
        });
    }
}

// overall metrics(number of contacts, interactions and avg. interactions per contact)
const overallMetrics = async(req,res)=>{
    try {
        const [totalContacts, totalInteractions, totalTags] = await Promise.all(
            [
                prisma.contact.count({
                    where: {userId: req.user.id}
                }),
                prisma.interaction.count({
                    where: {userId: req.user.id}
                }),
                prisma.tag.count({
                    where:{userId:req.user.id}
                })
            ]
        );

        const avgInteractionPerContact = totalContacts? (totalInteractions/totalContacts).toFixed(2): 0;

        return res.json({
            data: {totalContacts, totalInteractions, avgInteractionPerContact, totalTags}
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong while fetching metrics"
        });
    }
}

// follow-ups list - premium
//  Most interacted contact
const mostInteractedContacts = async(req, res)=>{
    const limit = parseInt(req.query.limit, 10) || 10;

    try {
        const contacts = await prisma.contact.findMany({
            where:{userId:req.user.id},
            take: limit,
            orderBy:{
                interactions:{
                    _count: "desc"
                }
            },
            select:{
                id: true,
                firstName: true,
                lastName: true,
                company:true,
                jobRole: true,
                email: true,
                phone: true,
                _count:{ //count of interactions
                    select:{interactions:true}
                }
            }
        });

        // to rename _count.interactions
        const result = contacts.map(c=>({
            id: c.id,
            firstName: c.firstName,
            lastName: c.lastName,
            email: c.email,
            phone: c.phone,
            company: c.company,
            jobRole: c.jobRole,
            interactionCount: c._count.interactions
        }));

        return res.json({data: result});

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong while fetching most Interacted contact"
        });
    }
}

export{
    recentlyContacted,
    staleContacts,
    contactSummary,
    overallMetrics,
    mostInteractedContacts
}