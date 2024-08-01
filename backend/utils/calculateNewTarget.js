export default function calculateNewTarget(weight, reps, type, increaseFactor) {
  let roundedWeight;

  // Convert weight to float
  const weightAsFloat = parseFloat(weight);

  if (type === "dumbbell") {
    roundedWeight = Math.round((weightAsFloat * increaseFactor) / 2) * 2;
  } else {
    roundedWeight = Math.round((weightAsFloat * increaseFactor) / 2.5) * 2.5;
  }

  // Define a small tolerance for floating-point comparisons
  const tolerance = 0.001;

  // console.log("Calculating new target:");
  // console.log(`  Input weight: ${weightAsFloat}`);
  // console.log(`  Input reps: ${reps}`);
  // console.log(`  Exercise type: ${type}`);
  // console.log(
  //   `  Calculated ${type || "default"} rounded weight: ${roundedWeight}`
  // );

  // Calculate the incremented reps
  const incrementedReps = parseInt(reps) + 1;

  // Compare with tolerance to handle precision issues
  if (Math.abs(roundedWeight - weightAsFloat) > tolerance) {
    // console.log(`  Target weight updated to: ${roundedWeight}`);
    // console.log(`  Reps remain the same: ${reps}`);
    return { weight: roundedWeight, reps };
  } else {
    // console.log(`  Target weight remains the same: ${weightAsFloat}`);
    // console.log(`  Reps increase by 1: ${incrementedReps}`);
    return { weight: weightAsFloat, reps: incrementedReps };
  }
}
