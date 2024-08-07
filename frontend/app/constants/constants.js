export const muscleGroups = [
  "Abs",
  "Calves",
  "Biceps",
  "Rear Delts",
  "Side Delts",
  "Traps",
  "Triceps",
  "Back",
  "Quads",
  "Glutes",
  "Hamstrings",
  "Chest",
  "Front Delts",
];

export const exerciseTemplate = {
  name: "",
  type: "barbell",
  videoLink: "",
  muscleGroup: muscleGroups[0],
};
export const exerciseTypes = [
  "barbell",
  "machine",
  "dumbbell",
  "bodyweight",
  "cable",
];

export const exercises = {
  Abs: [
    { name: "Machine Crunch", type: "machine" },
    { name: "Slant Board Sit-Up", type: "bodyweight" },
    { name: "Reaching Sit-Up", type: "bodyweight" },
    { name: "V-Up", type: "bodyweight" },
    { name: "Modified Candlestick", type: "bodyweight" },
    { name: "Hanging Knee Raise", type: "bodyweight" },
    { name: "Hanging Straight Leg Raise", type: "bodyweight" },
  ],
  Calves: [
    { name: "Calves on Calf Machine", type: "machine" },
    { name: "Stair Calves", type: "bodyweight" },
    { name: "Calves on Leg Press", type: "machine" },
    { name: "Smith Machine Calves", type: "machine" },
  ],
  Biceps: [
    { name: "Barbell Curl", type: "barbell" },
    { name: "EZ Curl", type: "barbell" },
    { name: "Close Grip Barbell Curl", type: "barbell" },
    { name: "2-Arm Dumbbell Curl", type: "dumbbell" },
    { name: "Cable Curl", type: "cable" },
    { name: "Incline Dumbbell Curl", type: "dumbbell" },
    { name: "Dumbbell Twist Curl", type: "dumbbell" },
    { name: "Hammer Curl", type: "dumbbell" },
    { name: "Dumbbell Spider Curl", type: "dumbbell" },
    { name: "Alternating Dumbbell Curl", type: "dumbbell" },
    { name: "Cable Rope Twist Curl", type: "cable" },
  ],
  "Rear Delts": [
    { name: "Barbell Facepull", type: "barbell" },
    { name: "Dumbbell Facepull", type: "dumbbell" },
    { name: "Cable Facepull", type: "cable" },
    { name: "Dumbbell Rear Lateral Raise", type: "dumbbell" },
  ],
  "Side Delts": [
    { name: "Barbell Upright Row", type: "barbell" },
    { name: "Dumbbell Upright Row", type: "dumbbell" },
    { name: "Cable Upright Row", type: "cable" },
    { name: "Dumbbell Side Lateral Raise", type: "dumbbell" },
    { name: "Thumbs Down Lateral Raise", type: "dumbbell" },
  ],
  "Front Delts": [
    { name: "Standing Barbell Shoulder Press", type: "barbell" },
    { name: "Seated Barbell Shoulder Press", type: "barbell" },
    { name: "Seated Dumbbell Shoulder Press", type: "dumbbell" },
    { name: "High Incline Dumbbell Press", type: "dumbbell" },
    { name: "Shoulder Press Machine", type: "machine" },
    { name: "Standing Dumbbell Shoulder Press", type: "dumbbell" },
  ],
  Traps: [
    { name: "Barbell Shrug", type: "barbell" },
    { name: "Barbell Bent Over Shrug", type: "barbell" },
    { name: "Dumbbell Shrug", type: "dumbbell" },
    { name: "Dumbbell Bent Over Shrug", type: "dumbbell" },
  ],
  Triceps: [
    { name: "Skullcrusher", type: "barbell" },
    { name: "JM Press", type: "barbell" },
    { name: "Dips", type: "bodyweight" },
    { name: "Assisted Dips", type: "machine" },
    { name: "Dumbbell Skullcrusher", type: "dumbbell" },
    { name: "Cable Tricep Pushdown", type: "cable" },
    { name: "Cable Rope Pushdown", type: "cable" },
    { name: "Bar Skull", type: "barbell" },
    { name: "EZ Bar Overhead Tricep Extension", type: "barbell" },
    { name: "Barbell Overhead Tricep Extension", type: "barbell" },
    { name: "Seated EZ Bar Overhead Tricep Extension", type: "barbell" },
    { name: "Seated Barbell Overhead Tricep Extension", type: "barbell" },
    { name: "Cable Overhead Tricep Extension", type: "cable" },
    { name: "Medium Grip Bench Press", type: "barbell" },
    { name: "Close Grip Bench Press", type: "barbell" },
    { name: "Close Grip Pushup", type: "bodyweight" },
    { name: "Incline Close Grip Bench Press", type: "barbell" },
  ],
  Back: [
    { name: "Barbell Bent Over Row", type: "barbell" },
    { name: "Underhand EZ Bar Row", type: "barbell" },
    { name: "Row to Chest", type: "machine" },
    { name: "1-Arm Dumbbell Row", type: "dumbbell" },
    { name: "Chest Supported Row", type: "machine" },
    { name: "Row Machine", type: "machine" },
    { name: "2-Arm Dumbbell Row", type: "dumbbell" },
    { name: "Cable Row", type: "cable" },
    { name: "Overhand Pullup", type: "bodyweight" },
    { name: "Parallel Pullup", type: "bodyweight" },
    { name: "Underhand Pullup", type: "bodyweight" },
    { name: "Wide Grip Pullup", type: "bodyweight" },
    { name: "Assisted Overhand Pullup", type: "machine" },
    { name: "Assisted Parallel Pullup", type: "machine" },
    { name: "Assisted Underhand Pullup", type: "machine" },
    { name: "Normal Grip Pulldown", type: "machine" },
    { name: "Parallel Pulldown", type: "machine" },
    { name: "Underhand Pulldown", type: "machine" },
    { name: "Wide-Grip Pulldown", type: "machine" },
    { name: "Narrow Grip Pulldown", type: "machine" },
  ],
  Quads: [
    { name: "High Bar Squat", type: "barbell" },
    { name: "Close Stance Feet Forward Squats", type: "barbell" },
    { name: "Machine Feet Forward Squat", type: "machine" },
    { name: "Leg Press", type: "machine" },
    { name: "Hack Squat", type: "machine" },
    { name: "Front Squat", type: "barbell" },
    { name: "Front Squat (Alternate Grip)", type: "barbell" },
  ],
  Glutes: [
    { name: "Barbell Walking Lunge", type: "barbell" },
    { name: "Dumbbell Walking Lunge", type: "dumbbell" },
    { name: "Sumo Squat", type: "barbell" },
    { name: "Deficit Deadlift", type: "barbell" },
    { name: "25's Deadlift", type: "barbell" },
    { name: "Sumo Deadlift", type: "barbell" },
    { name: "Deadlift", type: "barbell" },
    { name: "Hex Bar Deadlift", type: "barbell" },
  ],
  Hamstrings: [
    { name: "Stiff-Legged Deadlift", type: "barbell" },
    { name: "Low Bar Good Morning", type: "barbell" },
    { name: "High Bar Good Morning", type: "barbell" },
    { name: "45 Degree Back Raise", type: "bodyweight" },
    { name: "Lying Leg Curl", type: "machine" },
    { name: "Seated Leg Curl", type: "machine" },
    { name: "Single-Leg Leg Curl", type: "machine" },
  ],
  Chest: [
    { name: "Flat Dumbbell Flye", type: "dumbbell" },
    { name: "Incline Dumbbell Flye", type: "dumbbell" },
    { name: "Cable Flye", type: "cable" },
    { name: "High Cable Flye", type: "cable" },
    { name: "Machine Chest Flye", type: "machine" },
    { name: "Cable Incline Flye", type: "cable" },
    { name: "Pec Dec Flye", type: "machine" },
    { name: "Medium Grip Bench Press", type: "barbell" },
    { name: "Wide Grip Bench Press", type: "barbell" },
    { name: "Flat Dumbbell Bench Press", type: "dumbbell" },
    { name: "Flat Machine Bench Press", type: "machine" },
    { name: "Pushup", type: "bodyweight" },
    { name: "Incline Medium Grip Bench Press", type: "barbell" },
    { name: "Incline Wide Grip Bench Press", type: "barbell" },
    { name: "Low Incline Dumbbell Press", type: "dumbbell" },
    { name: "Incline Dumbbell Press", type: "dumbbell" },
    { name: "Incline Machine Bench Press", type: "machine" },
  ],
};

export const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
  "Day 1",
  "Day 2",
  "Day 3",
  "Day 4",
  "Day 5",
  "Day 6",
  "Day 7",
];

export const templates = [
  {
    name: "Full Body",
    days: 3,
    dayLabels: [
      "Monday", // Day 1: Push Emphasis
      "Thursday", // Day 2: Legs Emphasis
      "Sunday", // Day 3: Pull Emphasis
    ],
    muscleGroups: [
      // Day 1 (Monday) - Push Emphasis
      [
        "Chest", // Horizontal Push becomes Chest
        "Chest", // Chest Isolation or Triceps becomes Chest
        "Front Delts", // Incline Push or Front Delts becomes Front Delts
        "Side Delts", // Side Delts
        "Back", // Vertical Pull becomes Back
        "Back", // Horizontal Pull becomes Back
        "Hamstrings", // Hamstrings Isolation becomes Hamstrings
        "Quads", // Quads
      ],
      // Day 2 (Thursday) - Legs Emphasis
      [
        "Quads", // Quads becomes Quads
        "Quads", // Quads becomes Quads
        "Hamstrings", // Hamstrings Hip Hinge becomes Hamstrings
        "Side Delts", // Side Delts
        "Back", // Vertical Pull becomes Back
        "Back", // Horizontal Pull becomes Back
        "Front Delts", // Incline Push or Front Delts becomes Front Delts
        "Chest", // Horizontal Push becomes Chest
      ],
      // Day 3 (Sunday) - Pull Emphasis
      [
        "Back", // Vertical Pull becomes Back
        "Back", // Horizontal Pull becomes Back
        "Rear Delts", // Rear Delts or Side Delts becomes Rear Delts
        "Biceps", // Biceps
        "Chest", // Horizontal Push becomes Chest
        "Chest", // Incline Push becomes Chest
        "Glutes", // Glutes
        "Hamstrings", // Hamstrings Isolation becomes Hamstrings
      ],
    ],
  },
  {
    name: "Full Body",
    days: 4,
    dayLabels: ["Monday", "Tuesday", "Thursday", "Friday"],
    muscleGroups: [
      // Day 1 (Monday)
      [
        "Chest", // Incline Push becomes Chest
        "Triceps", // Chest Isolation or Triceps
        "Chest", // Horizontal Push becomes Chest
        "Back", // Horizontal Pull
        "Back", // Vertical Pull
        "Side Delts", // Side Delts
        "Abs", // Abs
      ],
      // Day 2 (Tuesday)
      [
        "Quads", // Lower Body Quads
        "Quads", // Quads
        "Hamstrings", // Hamstring Isolation
        "Calves", // Calves
        "Triceps", // Triceps
        "Front Delts", // Front Delts
      ],
      // Day 3 (Thursday)
      [
        "Back", // Vertical Pull becomes Back
        "Back", // Vertical Pull becomes Back
        "Back", // Horizontal Pull becomes Back
        "Rear Delts", // Rear or Side Delts
        "Chest", // Horizontal Push becomes Chest
        "Chest", // Incline Push becomes Chest
        "Abs", // Abs
      ],
      // Day 4 (Friday)
      [
        "Glutes", // Glutes
        "Hamstrings", // Hamstring Hip Hinge becomes Hamstrings
        "Quads", // Quads
        "Biceps", // Biceps
        "Traps", // Traps
        "Calves", // Calves
      ],
    ],
  },
  {
    name: "Full Body  ",
    days: 5,
    dayLabels: ["Monday", "Tuesday", "Thursday", "Friday", "Saturday"],
    muscleGroups: [
      // Day 1 (Monday) - Chest Upper
      [
        "Chest", // Chest Upper becomes Chest
        "Chest", // Incline Chest becomes Chest
        "Chest", // Chest Isolation becomes Chest
        "Chest", // Horizontal Chest becomes Chest
        "Back", // Horizontal Pull
        "Rear Delts", // Rear or Side Delts
        "Abs", // Abs
      ],
      // Day 2 (Tuesday) - Quads Focused Legs
      [
        "Quads", // Quads Focused Legs
        "Quads", // Quads
        "Quads", // Quads
        "Hamstrings", // Hamstrings Isolation
        "Calves", // Calves
      ],
      // Day 3 (Thursday) - Back Upper
      [
        "Back", // Vertical Pull becomes Back
        "Back", // Vertical Pull becomes Back
        "Back", // Horizontal Pull becomes Back
        "Chest", // Horizontal Chest becomes Chest
        "Rear Delts", // Rear or Side Delts
        "Abs", // Abs
      ],
      // Day 4 (Friday) - Glute/Ham Focused Legs
      [
        "Glutes", // Glutes
        "Glutes", // Glutes
        "Hamstrings", // Hamstrings Hip Hinge becomes Hamstrings
        "Quads", // Quads
        "Calves", // Calves
      ],
      // Day 5 (Saturday) - Shoulders/Arms Upper
      [
        "Biceps", // Biceps
        "Triceps", // Triceps
        "Front Delts", // Front Delts
        "Traps", // Traps
        "Back", // Vertical Pull becomes Back
        "Chest", // Incline Chest becomes Chest
        "Abs", // Abs
      ],
    ],
  },
  {
    name: "Full Body",
    days: 6,
    dayLabels: [
      "Monday", // Day 1: Push
      "Tuesday", // Day 2: Legs
      "Thursday", // Day 3: Pull
      "Friday", // Day 4: Push
      "Saturday", // Day 5: Legs
      "Sunday", // Day 6: Pull
    ],
    muscleGroups: [
      // Day 1 (Monday) - Push
      [
        "Chest", // Incline Push becomes Chest
        "Chest", // Chest Isolation becomes Chest
        "Chest", // Horizontal Push becomes Chest
        "Rear Delts", // Rear or Side Delts
        "Biceps", // Biceps
      ],
      // Day 2 (Tuesday) - Legs
      [
        "Quads", // Quad becomes Quads
        "Quads", // Quad becomes Quads
        "Hamstrings", // Hamstring Isolation becomes Hamstrings
        "Calves", // Calves
        "Abs", // Abs
      ],
      // Day 3 (Thursday) - Pull
      [
        "Back", // Horizontal Pull becomes Back
        "Back", // Horizontal Pull becomes Back
        "Back", // Vertical Pull becomes Back
        "Biceps", // Biceps
        "Rear Delts", // Rear or Side Delts
        "Traps", // Traps
      ],
      // Day 4 (Friday) - Push
      [
        "Front Delts", // Front Delts
        "Triceps", // Triceps
        "Chest", // Horizontal Push becomes Chest
        "Biceps", // Biceps
        "Rear Delts", // Rear or Side Delts
      ],
      // Day 5 (Saturday) - Legs
      [
        "Glutes", // Glute becomes Glutes
        "Glutes", // Glute becomes Glutes
        "Hamstrings", // Hamstring Hip Hinge becomes Hamstrings
        "Quads", // Quad becomes Quads
        "Calves", // Calves
        "Abs", // Abs
      ],
      // Day 6 (Sunday) - Pull
      [
        "Back", // Vertical Pull becomes Back
        "Back", // Vertical Pull becomes Back
        "Back", // Horizontal Pull becomes Back
        "Traps", // Traps
        "Rear Delts", // Rear or Side Delts
        "Biceps", // Biceps
      ],
    ],
  },
];
