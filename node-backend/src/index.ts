import express, { Request, Response } from 'express';
import cors from 'cors'; 
import { PrismaClient } from '@prisma/client';
import { signinSchema, signupSchema } from './zodTypes';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import passport from './auth';

dotenv.config();

const PORT = 3001;

const prisma = new PrismaClient();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/auth/google', passport.authenticate('google', {
    session: false,
    scope: ['email', 'profile'], 
}));

app.get('/auth/google/callback', passport.authenticate('google',{
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/signin`,
}), function (req, res) { // @ts-ignore
    const token = req.user.token; 
    res.redirect(`${process.env.FRONTEND_URL}/?token=${token}`);
});


app.post('/signup', async (req, res: any) => {
    const { name, username, password } = req.body;

    const result = signupSchema.safeParse({ name, username, password });

    if (!result.success) {
        return res.status(400).json({
            message: 'Invalid input',
            errors: result.error.issues
        });
    }

    try {
        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10); // Hash with salt rounds of 10

        // Create user in the database
        const user = await prisma.user.create({
            data: {
                name,
                email: username,
                password: hashedPassword, // Store hashed password
            }
        });

        const token = jwt.sign({ id: user}, process.env.JWT_SECRET || "");


        return res.status(201).json({
            token: token,
            message: 'User created successfully',
        });
    } catch (error) {
        return res.status(409).json({
            message: 'Username already taken',
        });
    }
});

app.post('/signin', async (req: Request, res: any) => {
    const { username, password } = req.body;

    const { success } = signinSchema.safeParse({ username, password }); 

    if (!success) {
        return res.status(400).json({
            message: 'Invalid input',
        });
    }

   try {
        const user = await prisma.user.findUnique({
            where: {
                email: username,
            }
        });

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
            });
        }

        // @ts-ignore
        const isPasswordValid = bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Invalid password',
            });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "");

        return res.status(200).json({
            token: token,
            message: 'Signin successful'
        });
   }
    catch (error) {
     return res.status(500).json({
          message: 'Internal server error',
     });
    }
});

const authMiddleware = async (req: Request, res: Response, next: any) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: 'Authorization header is required',
        });
    }

    const token = authHeader.split(' ')[1];
    

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "");
        // @ts-ignore
        req.userId = decoded.id; // @ts-ignore
    
    } catch (error) {
        return res.status(401).json({
            message: 'Invalid token',
        });
    }

    next();
};


// @ts-ignore
app.get('/get-user', authMiddleware, async (req: Request, res: Response) => {
    try { // @ts-ignore
        
        const user = await prisma.user.findUnique({
            where: { // @ts-ignore
                id: req.userId
            }
        });
    
        if (!user) {
            return res.status(401).json({
                message: 'User not found',
            });
        }
    
        return res.status(200).json({
            name: user.name,
            username: user.email,
            id: user.id,
            total_games: user.total_games,
            wins: user.wins,
            draws: user.draws,
            losses: user.losses,
        });
    }
    catch (error) {
        return res.status(500).json({
            error,
            message: 'Internal server error',
        });
    }
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});