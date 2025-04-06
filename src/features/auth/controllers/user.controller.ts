import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { getUserByEmail, getUserByUsername, InsertUser } from "../models/user.model";
import { hashPassword } from "../utils/password.utils";

export const register = async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  try{
    // Validate input data
    if (!email || !username || !password) {
      res.status(400).json({
        message: "All fields are required"
      });
      return;
    }

    // Check if user already exists
    const existingUserByEmail = await getUserByEmail(email);
    const existingUserByUsername = await getUserByUsername(username);
    if (existingUserByEmail || existingUserByUsername) {
      res.status(409).json({ 
        message:"User already exists",
      });
      return;
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Clean up the user data
    const newUser = {
      email,
      username,
      password: hashedPassword,
    };

    // Insert new user into the database
    const user = await InsertUser(newUser);

    res.status(201).json({ 
      message: "User registered successfully",
      user
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "An unknown error occurred"
    });
  };
};

export const login = (req: Request, res: Response, _next: NextFunction) => {
  passport.authenticate("local", (err: any, user: Express.User | false, info: { message: any; }) => {
    if (err) {
      console.error("Authentication error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (!user) {
      return res.status(401).json({ message: info?.message || "Invalid credentials" });
    }

    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error("Login error:", loginErr);
        return res.status(500).json({ message: "Login failed" });
      }

      // Successful login – send response here and do NOT call next()
      return res.status(200).json({
        message: "User logged in successfully",
        user: {
          id: (user as any).id,
          username: (user as any).username,
          email: (user as any).email,
        },
      });
    });
  })(req, res);
};

export const logout = async (req: Request, res: Response) => {
  try{
    req.logout((err) => {
      if (err) {
        res.status(500).json({
          message: "Logout failed",
          error: err
        });
        return;
      }
      // Destroy the session
      req.session.destroy((err) => {
        if (err) {
          res.status(500).json({
            message: "Logout failed",
            error: err
          });
          return;
        }
        // Clear the cookie
        res.clearCookie("connect.sid");
        res.status(200).json({ message: "User logged out successfully" });
      });
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "An unknown error occurred"
    });
  }
};

export const getCurrentUser = (req: Request, res: Response) => {
  try {
    res.status(200).json({
      user: req.user,
      message: "User retrieved successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "An unknown error occurred"
    });
  }
};