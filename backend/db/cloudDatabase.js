import { Database } from "@sqlitecloud/drivers";

export function createCloudDatabase({ dbUri = process.env.DB_URI } = {}) {
  return new Database(dbUri);
}
