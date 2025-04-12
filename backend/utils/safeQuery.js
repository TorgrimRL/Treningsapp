import db from "../remoteDatabase.js";

export async function safeQuery(strings, ...values) {
  const maxRetries = 7;
  let attempts = 0;
  let delay = 1000;
  let hadRetry = false;

  while (attempts < maxRetries) {
    try {
      const result = await db.sql(strings, ...values);
      return { result, hadRetry };
    } catch (error) {
      if (error.code === "ECONNRESET") {
        if (attempts === 0) {
          hadRetry = true;
        }
        attempts++;
        console.error(
          `ECONNRESET oppdaget (forsøk ${attempts}/${maxRetries}). Venter ${delay} ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      } else {
        throw error;
      }
    }
  }
  throw new Error("Max antall forsøk nådd for safeQuery");
}
