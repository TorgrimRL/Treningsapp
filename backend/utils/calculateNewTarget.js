export default function calculateNewTarget(weight, reps, type) {
  const increaseFactor = 1.025;
  let roundedWeight;

  if (type === "dumbbell") {
    roundedWeight = Math.round((weight * increaseFactor) / 2) * 2;
  } else {
    roundedWeight = Math.round((weight * increaseFactor) / 2.5) * 2.5;
  }
  if (roundedWeight !== weight) {
    return { weight: roundedWeight, reps };
  } else {
    return { weight: weight, reps: reps + 1 };
  }
}
