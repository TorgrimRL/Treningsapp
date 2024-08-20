export default function calculateNewTarget(
  weight,
  reps,
  type,
  previousFactor,
  currentFactor
) {
  const increaseFactor = currentFactor;
  const baseWeight = weight / previousFactor;

  let roundedWeight;

  const weightAsFloat = parseFloat(baseWeight);

  if (type === "dumbbell") {
    roundedWeight = Math.round((weightAsFloat * increaseFactor) / 2) * 2;
  } else {
    roundedWeight = Math.round((weightAsFloat * increaseFactor) / 2.5) * 2.5;
  }

  const tolerance = 0.001;

  const incrementedReps = parseInt(reps, 10) + 1;
  if (weight === 30) {
    console.log("=== Debug Calculation ===");
    console.log(`Base Weight: ${baseWeight.toFixed(2)}`);
    console.log(`Weight as Float: ${weightAsFloat.toFixed(2)}`);
    console.log(`Increase Factor: ${increaseFactor}`);
    console.log(`Rounded Weight: ${roundedWeight.toFixed(2)}`);
    console.log(`Incremented Reps: ${incrementedReps}`);
  }

  if (Math.abs(roundedWeight - weight) > tolerance) {
    if (weight === 30) {
      console.log(
        `Returning new target: Weight = ${roundedWeight}, Reps = ${reps}`
      );
    }
    return { weight: roundedWeight, reps };
  } else {
    if (weight === 30) {
      console.log(
        `Returning incremented reps: Weight = ${weight}, Reps = ${incrementedReps}`
      );
    }
    return { weight: weight, reps: incrementedReps };
  }
}
