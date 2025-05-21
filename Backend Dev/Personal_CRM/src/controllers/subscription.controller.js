import stripe from "../utils/stripe.utils.js";
import prisma from "../db/db.config.js";

export const createCheckoutSession = async(req,res)=>{
    const wantsTrial = req.query.trial==='true' || req.query.trial===true;
    try {
    const user = req.user;
    let customerId;
    const existing = await prisma.subscription.findUnique({
        where:{
            userId:user.id
        }
    });

    if(existing?.stripeCustomerId){
        customerId = existing.stripeCustomerId;
    }else{
        const customer = await stripe.customer.create({
            email: user.email,
            name: `${user.firstName} ${user.lastName || ""}`.trim(),
            metadata: {userId: user.id}
        });

        customerId = customer.id;
    }
    
    const subscription_data = {
        metadata:{userId: user.id}
    }
    // stripe checkout session
        if(wantsTrial) subscription_data.trial_period_days = 10;
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ["card"],
            mode: "subscription",
            line_items: [{price: process.env.STRIPE_MONTHLY_PRICE_ID, quantity: 1}],
            subscription_data,
            success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`,
            metadata:{userId: user.id}
        });
    
     // update subscription record
    await prisma.subscription.upsert({
        where:{
            userId: user.id
        },
        update: {stripeCustomerId: customerId, priceId: process.env.STRIPE_MONTHLY_PRICE_ID},
        create:{
            userId: user.id,
            stripeCustomerId: customerId,
            stripeSubscriptionId: 'pending',
            status: wantsTrial? 'TRIALING' : 'INCOMPLETE',
            priceId: process.env.STRIPE_MONTHLY_PRICE_ID,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(),
            trialEnd:wantsTrial? new Date(Date.now()+10*24*60*60*1000): null,
            createdAt: new Date()
        }
    });
} catch (error) {
    console.error(error);
    return res.status(500).json({
        message: "Stripe session failed"
    });
}

}