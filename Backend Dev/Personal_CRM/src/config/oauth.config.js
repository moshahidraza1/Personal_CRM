

export default{
    google:{
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BASE_URL}/api/v1/auth/google/callback`,
        scope: ["profile", "email"]
    },

    github:{
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: `${process.env.BASE_URL}/api/v1/auth/github/callback`,
        scope: ["user:email", "read:user"]
        //TODO: how to get profile details like firstName and lastName
    }
}