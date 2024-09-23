"use server";
import { Account, ID } from "node-appwrite";

import { createAdminClient, createSessionClient } from "./appwrite";
import { cookies } from "next/headers";
import { parseStringify } from "../utils";

export const signIn = async ({ email, password }: signInProps) => {
  try {
    const { account } = await createAdminClient();
    const session = await account.createEmailPasswordSession(email, password);

    return parseStringify(session);
  } catch (err) {
    console.log(err);
  }
};

export const signUp = async (userData: SignUpParams) => {
  const { email, firstName, lastName, password } = userData;
  try {
    const { account, database } = await createAdminClient();
    const newUserAccount = await account.create(
      ID.unique(),
      email,
      password,
      `${firstName} ${lastName}`
    );
    const session = await account.createEmailPasswordSession(email, password);

    cookies().set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });
    return parseStringify(newUserAccount);
  } catch (err) {
    console.log(err);
  }
};

export async function getLoggedInUser() {
  try {
    const { account } = await createSessionClient();
    const user = await account.get();

    // const user = await getUserInfo({ userId: result.$id });

    return parseStringify(user);
  } catch (err) {
    console.log(err);
  }
}

export async function logoutAccount() {
  try {
    const { account } = await createSessionClient();

    cookies().delete("appwrite-session");

    await account.deleteSession("current");
  } catch (error) {
    return null;
  }
}
