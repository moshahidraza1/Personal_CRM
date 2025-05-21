import stripe from "../utils/stripe.utils.js";
import prisma from "../db/db.config.js";

export const handleStripeWebhook = async(req, res)=>{
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    const data = event.data.object;

    try {
        
        switch (event.type) {
            case "customer.subscription.created":
            case "customer.subscription.updated":
                const customerStatus = await prisma.subscription.upsert({
                    where: {
                        stripeSubscriptionId: data.id
                    },

                    update:{
                        status: data.status.toUpperCase(),
                        currentPeriodStart: new Date(data.current_period_start *1000), //
                        currentPeriodEnd: new Date(data.current_period_end*1000),
                        cancelAtPeriodEnd: data.cancel_at_period_end,
                        trialEnd: data.trial_end? new Date(data.trial_end * 1000): null,
                        createdAt: new Date()
                    }
                });
                if(customerStatus.status === 'ACTIVE' || customerStatus.status === 'TRIALING'){
                    await prisma.user.update({
                        where:{
                            id: customerStatus.userId
                        },
                        data: {role: "PREMIUM"}
                    });
                }
                
                break;

                case "customer.subscription.deleted":
                    const sub = await prisma.subscription.update({
                        where:{
                            stripeSubscriptionId: data.id
                        },
                        data:{status: "CANCELLED"}
                    });

                    // downhrade user
                    await prisma.user.update({
                        where:{
                            id: sub.userId,
                        },
                        data: {role: "FREE"}
                    });

                break;
        }
        res.json({received: true});
    } catch (err) {
        console.error('Webhook processing error: ', err);
        res.status(500).json({error: "Webhooks Processing Failed"})
    }
}