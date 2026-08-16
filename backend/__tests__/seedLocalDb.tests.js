import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createLocalDatabase } from "../db/localDatabase.js";
import { buildPersonalRecordHistory } from "../utils/personalRecords.js";
import {
  demoCredentials,
  seedLocalDatabase,
} from "../scripts/seedLocalDb.js";

async function readSeededRows(dbPath) {
  const db = createLocalDatabase({ dbPath });

  try {
    // noinspection SqlNoDataSourceInspection
    const users = await db.sql("SELECT * FROM users");
    // noinspection SqlNoDataSourceInspection
    const exercises = await db.sql("SELECT * FROM exercises");
    // noinspection SqlNoDataSourceInspection
    const mesocycles = await db.sql(
      "SELECT * FROM Mesocycles ORDER BY id"
    );
    return { users, exercises, mesocycles };
  } finally {
    await db.close();
  }
}

describe("local database seed script", () => {
  let tempDir;
  let dbPath;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "treningsapp-seed-"));
    dbPath = path.join(tempDir, "seed.sqlite");
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("refuses to run unless local mode is explicitly enabled", async () => {
    const previousMode = process.env.DB_MODE;
    delete process.env.DB_MODE;

    await expect(seedLocalDatabase({ dbPath, logger: null })).rejects.toThrow(
      "Refusing to seed unless DB_MODE=local"
    );

    if (previousMode === undefined) {
      delete process.env.DB_MODE;
    } else {
      process.env.DB_MODE = previousMode;
    }
  });

  it("creates deterministic local demo data", async () => {
    const first = await seedLocalDatabase({
      dbPath,
      requireLocalMode: false,
      logger: null,
    });
    const second = await seedLocalDatabase({
      dbPath,
      requireLocalMode: false,
      logger: null,
    });

    expect(second).toEqual(first);

    const { users, exercises, mesocycles } = await readSeededRows(dbPath);
    expect(users).toHaveLength(1);
    expect(users[0]).toMatchObject({
      username: demoCredentials.username,
      password: null,
      auth_provider: "auth0",
      auth0_sub: demoCredentials.auth0Sub,
      email: demoCredentials.username,
      email_verified: 1,
    });

    expect(exercises).toHaveLength(12);
    expect(exercises.map(({ name }) => name)).toEqual([
      "Paused Bench Press",
      "Chest Supported Row",
      "Cable Lateral Raise",
      "Lat Pulldown",
      "Triceps Pressdown",
      "Incline Dumbbell Curl",
      "Romanian Deadlift",
      "Hack Squat",
      "Leg Extension",
      "Seated Leg Curl",
      "Standing Calf Raise",
      "Cable Crunch",
    ]);
    expect(mesocycles).toHaveLength(3);
    expect(mesocycles.filter((row) => row.isCurrent)).toHaveLength(1);
    expect(mesocycles[0]).toMatchObject({
      id: 1,
      name: "Demo Current Block",
      weeks: 5,
      daysPerWeek: 2,
      user_id: 1,
    });
    const currentPlan = JSON.parse(mesocycles[0].plan);
    const completedPlan = JSON.parse(mesocycles[1].plan);
    const oldPlan = JSON.parse(mesocycles[2].plan);
    expect(currentPlan).toHaveLength(10);
    [...currentPlan, ...completedPlan, ...oldPlan].forEach((day) => {
      expect(day.exercises).toHaveLength(6);
      day.exercises.forEach((seededExercise) => {
        expect(seededExercise.muscleGroup).toEqual(expect.any(String));
        expect(seededExercise.muscleGroup).not.toBe("");
        expect(seededExercise.sets).toHaveLength(3);
      });
    });
    expect(
      currentPlan[0].exercises.map(({ exercise: exerciseName }) => exerciseName)
    ).toEqual([
      "Paused Bench Press",
      "Chest Supported Row",
      "Cable Lateral Raise",
      "Lat Pulldown",
      "Triceps Pressdown",
      "Incline Dumbbell Curl",
    ]);
    expect(
      currentPlan[1].exercises.map(({ exercise: exerciseName }) => exerciseName)
    ).toEqual([
      "Hack Squat",
      "Romanian Deadlift",
      "Leg Extension",
      "Seated Leg Curl",
      "Standing Calf Raise",
      "Cable Crunch",
    ]);
    expect(currentPlan[0].exercises[0].sets).toMatchObject([
      { weight: "80", reps: "6", completed: true },
      { weight: "80", reps: "7", completed: true },
      { weight: "80", reps: "8", completed: true },
    ]);
    expect(currentPlan[2].exercises[0].sets).toMatchObject([
      { weight: "82.5", reps: "6", completed: true },
      { weight: "82.5", reps: "7", completed: true },
      { weight: "82.5", reps: "8", completed: true },
    ]);
    expect(currentPlan[4].exercises[0].sets).toMatchObject([
      { weight: "85", reps: "6", completed: false },
      { weight: "85", reps: "7", completed: false },
      { weight: "85", reps: "8", completed: false },
    ]);
    [...currentPlan.slice(0, 4), ...completedPlan].forEach((day) => {
      day.exercises.forEach((seededExercise) => {
        expect(seededExercise.sets.every(({ completed }) => completed)).toBe(
          true
        );
      });
    });
    [...currentPlan.slice(4), ...oldPlan].forEach((day) => {
      day.exercises.forEach((seededExercise) => {
        expect(seededExercise.sets.some(({ completed }) => completed)).toBe(
          false
        );
      });
    });
    expect(
      currentPlan.slice(0, 4).map(({ startedAt, completedAt }) => ({
        startedAt,
        completedAt,
      }))
    ).toEqual([
      {
        startedAt: "2026-07-20T16:00:00.000Z",
        completedAt: "2026-07-20T17:05:00.000Z",
      },
      {
        startedAt: "2026-07-22T16:30:00.000Z",
        completedAt: "2026-07-22T17:35:00.000Z",
      },
      {
        startedAt: "2026-07-27T16:00:00.000Z",
        completedAt: "2026-07-27T17:03:00.000Z",
      },
      {
        startedAt: "2026-07-29T16:30:00.000Z",
        completedAt: "2026-07-29T17:38:00.000Z",
      },
    ]);
    expect(
      completedPlan.map(({ startedAt, completedAt }) => ({
        startedAt,
        completedAt,
      }))
    ).toEqual([
      {
        startedAt: "2026-01-12T16:00:00.000Z",
        completedAt: "2026-01-12T17:05:00.000Z",
      },
      {
        startedAt: "2026-01-14T16:30:00.000Z",
        completedAt: "2026-01-14T17:35:00.000Z",
      },
    ]);
    expect(mesocycles[1].completedDate).toBe(
      "2026-01-14T17:35:00.000Z"
    );

    currentPlan.slice(4).forEach((day) => {
      expect(day).not.toHaveProperty("startedAt");
      expect(day).not.toHaveProperty("completedAt");
    });
    expect(mesocycles[2].name).toBe("Old Upper Focus");
    expect(oldPlan[0]).not.toHaveProperty("startedAt");
    expect(oldPlan[0]).not.toHaveProperty("completedAt");

    [...currentPlan.slice(0, 4), ...completedPlan].forEach((day) => {
      expect(Number.isFinite(Date.parse(day.startedAt))).toBe(true);
      expect(Number.isFinite(Date.parse(day.completedAt))).toBe(true);
      expect(Date.parse(day.startedAt)).toBeLessThanOrEqual(
        Date.parse(day.completedAt)
      );
    });

    const recordHistory = buildPersonalRecordHistory(mesocycles);
    expect(
      recordHistory
        .filter(
          (record) =>
            record.exerciseKey === "paused bench press" &&
            record.weightKey === "80"
        )
        .map(
          ({
            mesocycleName,
            week,
            day,
            reps,
            setIndex,
            setPosition,
            workoutDate,
          }) => ({
            mesocycleName,
            week,
            day,
            reps,
            setIndex,
            setPosition,
            workoutDate,
          })
        )
    ).toEqual([
      {
        mesocycleName: "Completed Demo Block",
        week: 1,
        day: 1,
        reps: 6,
        setIndex: 0,
        setPosition: 1,
        workoutDate: "2026-01-12T16:00:00.000Z",
      },
      {
        mesocycleName: "Completed Demo Block",
        week: 1,
        day: 1,
        reps: 7,
        setIndex: 1,
        setPosition: 2,
        workoutDate: "2026-01-12T16:00:00.000Z",
      },
      {
        mesocycleName: "Completed Demo Block",
        week: 1,
        day: 1,
        reps: 8,
        setIndex: 2,
        setPosition: 3,
        workoutDate: "2026-01-12T16:00:00.000Z",
      },
    ]);
    expect(
      recordHistory
        .filter(
          (record) =>
            record.exerciseKey === "paused bench press" &&
            record.weightKey === "82.5"
        )
        .map(({ mesocycleName, week, day, reps, setIndex, workoutDate }) => ({
          mesocycleName,
          week,
          day,
          reps,
          setIndex,
          workoutDate,
        }))
    ).toEqual([
      {
        mesocycleName: "Demo Current Block",
        week: 2,
        day: 1,
        reps: 6,
        setIndex: 0,
        workoutDate: "2026-07-27T16:00:00.000Z",
      },
      {
        mesocycleName: "Demo Current Block",
        week: 2,
        day: 1,
        reps: 7,
        setIndex: 1,
        workoutDate: "2026-07-27T16:00:00.000Z",
      },
      {
        mesocycleName: "Demo Current Block",
        week: 2,
        day: 1,
        reps: 8,
        setIndex: 2,
        workoutDate: "2026-07-27T16:00:00.000Z",
      },
    ]);
  });
});
