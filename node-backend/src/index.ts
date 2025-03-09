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
app.options('*', cors()); // Enable pre-flight request for all routes

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World from Arslan');
});

app.get('/auth/google', passport.authenticate('google', {
    session: false,
    scope: ['email', 'profile'],
}));

app.get('/auth/google/callback', passport.authenticate('google', {
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

        const token = jwt.sign({ id: user }, process.env.JWT_SECRET || "");


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
        console.log(error);
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
        next();

    } catch (error) {
        return res.status(401).json({
            message: 'Invalid token',
        });
    }


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
            image: user?.image,
        });
    }
    catch (error) {
        return res.status(500).json({
            error,
            message: 'Internal server error',
        });
    }
})

// @ts-ignore
app.get('/get-user-data', authMiddleware, async (req: Request, res: Response) => {
    try {
      const user = await prisma.user.findUnique({ // @ts-ignore
        where: { id: req.userId },
        include: {
          white: {
            include: { white: true, black: true, winner: true },
            orderBy: { createdAt: 'asc' },
          },
          black: {
            include: { white: true, black: true, winner: true },
            orderBy: { createdAt: 'asc' },
          },
        },
      });
  
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
  
      // Combine and sort games chronologically
      const games = [...user.white, ...user.black].sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      );
  
      let tempWins = 0;
      let tempLosses = 0;
      let tempDraws = 0;
  
      const recentGames = games.map((game) => {
        // Calculate rating BEFORE this game by using stats so far
        const rating =
          1000 + tempWins * 10 - tempLosses * 5 + tempDraws * 2;
  
        // Opponent details
        const opponent =
          game.whiteId === user.id
            ? game.black.name || 'Unknown'
            : game.white.name || 'Unknown';
  
        // Result calculation
        const result =
          game.winnerId === user.id
            ? 'win'
            : game.winnerId
              ? 'loss'
              : 'draw';
  
        // Date calculation
        const dateDiff = Math.round(
          (new Date().getTime() - game.createdAt.getTime()) /
            (1000 * 60 * 60 * 24)
        );
  
        // Update stats **after** recording this game
        if (game.winnerId === user.id) {
          tempWins++;
        } else if (game.winnerId) {
          tempLosses++;
        } else {
          tempDraws++;
        }
  
        return {
          opponent,
          result,
          rating, // Historical rating before this game
          date: dateDiff === 0 ? 'Today' : `${dateDiff} day(s) ago`,
        };
      });
  
      // Take last 5 games
      const last5Games = recentGames.slice(-5).reverse();
  
      // Final rating based on total stats
      const currentRating =
        1000 + tempWins * 10 - tempLosses * 5 + tempDraws * 2;
  
      return res.status(200).json({
        id: user.id,
        username: user.email,
        name: user.name,
        image: user.image,
        joinDate: user.createdAt.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        }),
        rating: currentRating,
        stats: {
          wins: tempWins,
          draws: tempDraws,
          losses: tempLosses,
          totalGames: tempWins + tempLosses + tempDraws,
        },
        recentGames: last5Games,
      });
    } catch (error) {
      return res.status(500).json({ // @ts-ignore
        error: error.message,
        message: 'Internal server error',
      });
    }
  });
  

// @ts-ignore
app.get('/get-game/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const gameId = req.params.id;

        const game = await prisma.game.findUnique({
            where: {
                id: gameId,
            }
        });

        if (!game) {
            return res.status(404).json({
                message: 'Game not found',
            });
        }

        return res.status(200).json({
            game,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
        });
    }
});

// @ts-ignore
app.get('/get-opponent/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const oppId = req.params.id;

        const opponent = await prisma.user.findUnique({
            where: {
                id: oppId,
            }
        });

        return res.status(200).json({
            opponent
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});