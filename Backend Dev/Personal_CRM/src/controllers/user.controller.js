import prisma from "../db/db.config.js";
import bcrypt from "bcrypt";
const createUser = async (req,res)=>{
    const {username, firstName, lastName, email, password} = req.body;
    if(![username, firstName, lastName, email, password].every((field)=>field && field.trim()!== "")){
        return res.json({status:400, message:"All fields are required"});
    }
    try {
        // check if user already exists
        const findUser = await prisma.user.findFirst({
            where:{
            OR:[{email},{username}]
            }
        });
        
        if(findUser){
            return res.json({status:400, message:"User already exists"});
        }
        // hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data:{
                username,
                firstName,
                lastName,
                email,
                password:hashedPassword
            }
        })
        const createdUser = await prisma.user.findUnique({
            where:{
                id:newUser.id
            },
            select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                email: true,
                createdAt: true,
            }
        });
        if(!createdUser){
            return res.json({status:500, message:"Something went wrong while creating user"});
        }
        return res.json({status:200, message:"User created successfully", data:newUser});
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message:"Something went wrong while creating user"});
        
    }
}

// login user

const loginUser = async (req,res)=>{
    //get user credentials
    const {email,username, password} = req.body;
    // console.log('req.body:', req.body); 
    if(!email && !username){
        return res.json({status:400, message:"Email or username is required"});
    }
    // check if user have correct credentials
    const conditions = [];
    if(email) conditions.push({email});
    if(username) conditions.push({username});
    const user = await prisma.user.findFirst({
        where:{
            OR:conditions
        }
    })
    if(!user){
       return res.json({status:400, message:"User not found"});
    }
    // check if password is correct
    const passwordMatch = await bcrypt.compare(password, user.password);
    if(!passwordMatch){
       return res.json({status:400, message:"Invalid password"});
    }

    return res.json({status:200, message:"Login successful"});

};

export {createUser, loginUser};