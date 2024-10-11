// @ts-nocheck
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import { PrismaClient } from '@prisma/client';
import jwt from "jsonwebtoken"

const prisma = new PrismaClient();

try {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: "http://localhost:3001/auth/google/callback",
      passReqToCallback: true
    },
    async function (request: any, accessToken: string, refreshToken: string, profile: any, done: any) {
      try {
          // If user doesn't exist by googleId, check by email
          let user = await prisma.user.findUnique({
            where: {
              email: profile.email,
            },
          });

          // If no user, create a new one
          if (!user) {
            user = await prisma.user.create({
              data: {
                email: profile.email,
                name: profile.displayName,
                // Additional fields can be set here as needed
              },
            });
          } 
          
          
          const token = jwt.sign({ id: user.id, email:user.email }, process.env.JWT_SECRET)



        // Proceed with user sign-in
        return done(null, {token});
      } catch (err) {
        return done(err);
      }
    }
  ));

  passport.serializeUser((user: any, done) => {
      done(null, user);
  });

  passport.deserializeUser((user: any, done) => {
      done(null, user);
  });

  export default passport;
}
catch(e) {
    console.log(e)
}

