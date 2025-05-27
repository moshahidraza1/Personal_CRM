import prisma from "../db/db.config.js";

export const createNote = async(req, res)=>{
    const {contactId, title, content} = req.body;
    const userId = req.user.id;
    try{
        
        const note = await prisma.note.create({
            data:{
                contactId, userId, title, content
            }
        });
        res.status(201).json({
            message:"Successfully added note"
        });
    }catch(err){
        console.error(err);
        res.status(500).json({
            message: "Failed to create note"
        });
    }
};

export const listNotes = async(req, res)=>{
    const userId = req.user.id;

    try{
        const notes = await prisma.note.findMany({
            where:{
                userId
            },
            orderBy:{createdAt:"desc"}
        });

        if(!notes || notes.length==0){
            return res.statu(401).json({
                message: "No notes available with the requested filters"
            });
        }

        res.status(201).json({data: notes});
    }catch(err){
        console.error(err);
        res.status(500).json({
            message: "Failed to list notes"
        });
    }
}

// get note by either noteId || contactId || title
export const getNote = async(req, res)=>{
    const {noteId, contactId, title} = req.param;
    if(!noteId && !contactId && !title){
        return res.status(401).json({
            message: "No parameters passed to filter notes"
        });
    }
    try {
        const filters = {};
    
        if(noteId) filters.id = noteId;
        if(contactId) filters.contactId = contactId;
        if(title) filters.title = title;
    
        const fetchedNote = await prisma.note.findMany({
            where:{
                filters,
                userId: req.user.id
            }
        });
        // if there  no notes with given filter
        if(!fetchedNote || fetchedNote.length==0){
            return res.statu(401).json({
                message: "No notes available with the requested filters"
            });
        }
        return res.status(201).json({
            fetchedNote,
            message: "successfully fetched note"
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            Message: "Failed to fetch notes"
        });
    }

}

// update Note 
export const updateNote = async(req,res)=>{
    const {noteId, title, content} = req.body;

    if(!noteId || ( !title && !content)){
        return res.status(401).json({
            message: "Title or content is missing from request"
        });
    }
    try {
        const isNote = await prisma.note.findFirst({
            where:{
                id: noteId,
                userId: req.user.id
            }
        });
        if(!isNote){
            return res.status(401).json({
                message: "Note does not exist"
            });
        }
        const updatedNote = await prisma.note.update({
            where:{
                id: noteId,
                userId: req.user.id
            },
            data:{
                title,
                content
            }
        });
        return res.status(201).json({
            updatedNote,
            message:"Successfully update note"
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong while updating note"
        });
    }

}

// deleteNote
export const deleteNote = async(req,res)=>{
    const {noteId} = req.body;

    try {
        const isNote = await prisma.note.findFirst({
            where:{
                id: noteId,
                userId: req.user.id
            }
        });
        if(!isNote){
            return res.status(401).json({
                message: "Note does not exist"
            });
        }
        await prisma.note.delete({
            where:{
                id: noteId,
                userId: req.user.id
            }
        });
        return res.status(201).json({
            message: "Successfully delted note"
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            Message: "Something went wrong while deleting note"
        });
    }
}