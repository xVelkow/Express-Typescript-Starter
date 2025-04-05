import { postgres } from "@core/database/postgres";
import { eq, or } from "drizzle-orm";
import { users } from "../schemas/user.schema";
import { User, NewUser } from "../schemas/user.schema";

export const getUserByEmailOrUsername = async (emailOrUsername: string): Promise<User | undefined> => {
  const result = await postgres
    .select()
    .from(users)
    .where(
      or(
        eq(users.email, emailOrUsername),
        eq(users.username, emailOrUsername)
      )
    );
  return result[0] as User | undefined;
};

export const getUserById = async (id: number): Promise<User | undefined> => {
  const result = await postgres
    .select()
    .from(users)
    .where(eq(users.id, id));
  return result[0] as User | undefined;
};

export const getUserByUsername = async (username: string): Promise<User | undefined> => {
  const result = await postgres
    .select()
    .from(users)
    .where(eq(users.username, username));
  return result[0] as User | undefined;
};

export const getUserByEmail = async (email: string): Promise<User | undefined> => {
  const result = await postgres
    .select()
    .from(users)
    .where(eq(users.email, email));
  return result[0] as User | undefined;
};

export const InsertUser = async (user: NewUser): Promise<User> => {
  const result = await postgres
    .insert(users)
    .values(user)
    .returning();
  return result[0] as User;
};