// Terminal questions. Passwords are not shown, and never passed as arguments
// (which would be saved in your shell history).
import { createInterface } from "node:readline";
import { Writable } from "node:stream";
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "../src/server/auth/password-rules";

export function createPrompter() {
  if (!process.stdin.isTTY) throw new Error("Run this command yourself in an interactive terminal.");
  let hidden = false;
  const output = new Writable({
    write(chunk, _encoding, done) {
      if (!hidden) process.stdout.write(chunk);
      done();
    },
  });
  const rl = createInterface({ input: process.stdin, output, terminal: true });
  rl.on("SIGINT", () => {
    process.stdout.write("\nCancelled.\n");
    process.exit(1);
  });

  const ask = (question: string, secret = false) =>
    new Promise<string>((resolve) => {
      hidden = false;
      rl.question(question, (answer) => {
        if (secret) process.stdout.write("\n");
        hidden = false;
        resolve(answer);
      });
      hidden = secret;
    });

  async function newPassword() {
    const password = await ask(`Password (at least ${MIN_PASSWORD_LENGTH} characters, hidden): `, true);
    if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
      throw new Error(`Use ${MIN_PASSWORD_LENGTH} to ${MAX_PASSWORD_LENGTH} characters.`);
    }
    if ((await ask("Type it again: ", true)) !== password) throw new Error("The passwords do not match.");
    return password;
  }

  return { ask, newPassword, close: () => rl.close() };
}
