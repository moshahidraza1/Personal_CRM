import prisma from '../db/db.config.js';

const generateUsernameFromEmail = async (email)=> {
    const base = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g,'') || 'user';
    let name = base, i=1;
    while(await prisma.user.findUnique({
        where:{
            username:name
        }
    })){
        name = `${base}_${i++}`;
    }
    return name; 
}

function getSubscriptionEndDate(date){
    const now = new Date.now();
    const diff = new Date(date).getTime() - now.getTime();

  return Math.ceil(diff/24*60*60*1000);
}
export{
    generateUsernameFromEmail,
    getSubscriptionEndDate
}