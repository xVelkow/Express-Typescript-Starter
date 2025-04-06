import { postgres } from "@core/database/postgres";
import { eq, or } from "drizzle-orm";
import { users } from "../schemas/user.schema";
import { User, NewUser } from "../schemas/user.schema";

/* TEST ONLY */
export const createTestUser = async (user: NewUser): Promise<void> => {
  await postgres
    .insert(users)
    .values(user);
};
export const deleteTestUser = async (username: string): Promise<void> => {
  await postgres
    .delete(users)
    .where(eq(users.username, username))
    .execute();
};
/* TEST ONLY */

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