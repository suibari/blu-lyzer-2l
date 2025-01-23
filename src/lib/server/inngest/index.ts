import { Inngest } from "inngest";
import { doAnalyzeAndUpsertExistingUser, doAnalyzeAndUpsertNewUser } from "./functions";

export const inngest = new Inngest({ id: "blu-lyzer" });

export const functions = [
  doAnalyzeAndUpsertExistingUser,
  doAnalyzeAndUpsertNewUser,
];
