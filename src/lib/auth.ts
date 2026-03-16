import { betterAuth } from "better-auth";
import {Polar} from "@polar-sh/sdk";
import {polar,checkout,portal,usage,webhooks} from "@polar-sh/better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
import prisma from "./db";
import { polarClient } from "./polar";


export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    emailAndPassword:{
      enabled:true,
      autoSignIn:true,
    },
    socialProviders:{
        github:{
            clientId:process.env.GITHUB_CLIENT_ID as string,
            clientSecret:process.env.GITHUB_CLIENT_SECRET as string,
        },        google: { 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }, 


    },
    plugins: [
        polar({
            client: polarClient,
            createCustomerOnSignUp: true,
            use: [
                checkout({
                    products: [
                        {
                            productId: "b1ca04ec-fc52-43e1-8b68-559f566a221c",
                            slug: "syncEngine-Pro" // Custom slug for easy reference in Checkout URL, e.g. /checkout/syncEngine-Pro
                        }
                    ],
                    successUrl: process.env.POLAR_SUCCESS_URL,
                    authenticatedUsersOnly: true
                }),
                portal()
            ],
        })
    ]
});