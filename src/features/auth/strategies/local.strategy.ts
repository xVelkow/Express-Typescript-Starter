import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { comparePassword } from "../utils/password.utils";
import { NewUser } from "../schemas/user.schema";
import { getUserByEmailOrUsername, getUserById } from "../models/user.model";

declare global {
  namespace Express {
    interface User extends NewUser {
      password?: string;
    }
  }
};

passport.use(
  new LocalStrategy(
    {
      usernameField: "usernameOrEmail",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, usernameOrEmail, password, done) => {
      try {
        // Validate email & password
        if (!usernameOrEmail || !password) {
          return done(null, false, { message: "All fields are required" });
        }

        // Trim inputs to prevent whitespace issues
        usernameOrEmail = usernameOrEmail.trim();
        password = password.trim();

        // Find user by email or username
        const user = await getUserByEmailOrUsername(usernameOrEmail);

        // Check if user exists
        if (!user) {
          // Add a delay to prevent timing attacks
          await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 100));
          return done(null, false, { message: "Invalid credentials" });
        }

        // Check if password is correct
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
          return done(null, false, { message: "Invalid credentials" });
        }

        // Remove password from user object
        const { password: _, ...userWithoutPassword } = user;

        // Return user if everything is correct
        return done(null, userWithoutPassword);

      } catch (error) {
        done(error);
      }
    }
  )
);

passport.serializeUser((user: Express.User, done) => {
  try {
    done(null, user.id);
  } catch (error) {
    console.error("Serialize error:", error);
    done(error);
  }
});

passport.deserializeUser(async (id: number, done) => {
  try {
    // Check if id is valid
    if (!id) {
      return done(new Error("Invalid credentials"));
    }

    // Find user by id
    const user = await getUserById(id);

    // Check if user exists
    if (!user) {
      return done(null, false);
    };

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

    // Return user
    done(null, userWithoutPassword);

  } catch (error) {
    console.error("Deserialize error:", error);
    done(error);
  }
});