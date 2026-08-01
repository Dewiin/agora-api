import passport from "passport"
import bcrypt from "bcryptjs"
import { prisma } from "./prismaClient"

// services
import { generateUsername } from "../services/generateUsername"

// strategies
import { Strategy as LocalStrategy } from "passport-local"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import { Strategy as GithubStrategy } from "passport-github"

// types
import type { IVerifyOptions } from "passport-local";
import type { VerifyCallback as GoogleVerifyCallback, Profile as GoogleProfile } from "passport-google-oauth20";
import type { VerifyCallback as GithubVerifyCallback } from "passport-oauth2";
import type { Profile as GithubProfile } from "passport-github";

async function localVerifyFunction(
    email: string, 
    password: string, 
    done: (error: any, user?: Express.User | false, options?: IVerifyOptions) => void 
) {
    try {
        const user = await prisma.user.findUnique({
            where: { 
                email,
                provider: "LOCAL"
            }
        });
    
        if(!user) return done(null, false, { message: "User does not exist." });
        if(!user.password) return done(null, false, { message: "Email associated with google account." });

        const match = await bcrypt.compare(password, user.password);
        if(!match) return done(null, false, { message: "Incorrect username or password" });

        return done(null, user);
    } catch(err: any) {
        return done(err);
    }
}

async function googleVerifyFunction(
    accessToken: string, 
    refreshToken: string, 
    profile: GoogleProfile, 
    cb: GoogleVerifyCallback
) {
    try {
        const email = profile.emails?.[0]?.value;
        if(!email) return cb(null, false, { message: "No email found in google profile." });

        const username = await generateUsername(profile.displayName);

        const user = await prisma.user.upsert({
            where: { 
                email, 
                provider: "GOOGLE"
            },
            update: { displayName: profile.displayName },
            create: {
                username,
                email,
                displayName: profile.displayName,
                provider: "GOOGLE"
            }
        });
        if(!user) return cb(null, false, { message: "Email is linked to an existing account." });

        return cb(null, user);
    } catch(err: any) {
        return cb(err);
    }
}

async function githubVerifyFunction(
    accessToken: string,
    refreshToken: string,
    profile: GithubProfile,
    cb: GithubVerifyCallback
) {
    try {
        const username = await generateUsername(profile.displayName);

        const user = await prisma.user.upsert({
            where: { 
                email: profile.profileUrl,
                provider: "GITHUB" 
            },
            update: { displayName: profile.username || profile.displayName },
            create: {
                username,
                email: profile.profileUrl,
                displayName: profile.username || profile.displayName,
                provider: "GITHUB"
            }
        });

        return cb(null, user);
    } catch(err: any) {
        return cb(err);
    }
}

passport.use("local", new LocalStrategy({
    usernameField: "email",
}, localVerifyFunction));
passport.use("google", new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    scope: ["profile", "email"]
}, googleVerifyFunction));
passport.use("github", new GithubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    callbackURL: process.env.GITHUB_CALLBACK_URL!!,
    scope: ["user"]
}, githubVerifyFunction));
