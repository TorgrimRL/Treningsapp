# Concepts and copy

## Product vocabulary

| Current term | Meaning in the product | Onboarding treatment |
| --- | --- | --- |
| Training block | User-facing name for a mesocycle | Use this term first. Avoid “mesocycle” unless advanced detail is requested. |
| Current workout | The first incomplete day in the current training block | Explain after a plan exists, not during initial choice. |
| Template | Predefined day labels and muscle-group structure | Clarify that exercises can still be changed before saving. |
| Import | A future reusable weekly plan from pasted text or CSV | Clarify that it does not import completed workout history or PRs. |
| Sets | Number of work sets generated per exercise | Required for import and plan structure. |
| Weight | Starting/target number in the user's established unit system | The app currently has no per-set unit selector. Do not label onboarding fields as kg. |
| Target reps | Optional starting target | Can be left empty and set during Current workout. |
| Progression mode | How future targets change | Default to 2.5% per week and explain contextually in advanced settings. |
| Weight increment | Available equipment step used for rounding targets | Default is 2.5, or 2 for dumbbells. Avoid forcing this in basic onboarding. |
| Minimum weight | Lowest selectable load for an exercise | Advanced setting; default from exercise type and increment. |
| Deload | A lower-stress final week for recovery before the next block | Explain beside the checkbox; do not assume users know the term. |
| RIR | Reps in reserve | Existing Current workout copy explains it when RIR values appear. Keep it out of initial onboarding unless selected. |
| Personal record | Best valid logged performance derived from completed sets | Explain after first logging, not before plan creation. |

## Existing defaults

- Duration choices in the current details UI: 4, 5, or 6 weeks.
- Template route default: 4 weeks.
- Progression mode default: 2.5% per week (`percent`).
- Weight increment default: 2 for dumbbell, 2.5 for other types.
- Minimum weight default: zero for bodyweight; otherwise the weight increment.
- Import type fallback: barbell.
- Imported target reps: optional and represented as zero when unset.
- Final-week deload: off by default.

## Copy principles for the wizard

- Lead with the outcome: “Set up your first training block.”
- Use one short explanation per decision and reveal progression details only when requested.
- Keep labels consistent with the editor so the handoff does not feel like a different product.
- Never imply imported weight is kilograms; the user stays in their normal unit system.
- State defaults before submission, especially barbell type and increments for unmatched imports.
- Explain that all plans are reviewed before saving.
- Explain that importing creates a future plan only, never completed history.
- Use `text-balance` for headings and `text-pretty` for explanatory copy.

## Copy requiring product approval

- Product language: the application and `<html lang>` are currently English.
- Whether “training block” fully replaces “mesocycle” in all onboarding copy.
- Whether an onboarding question about training goal, experience, schedule, or equipment will actually influence a recommendation.
- Whether users should be told about weight-unit assumptions during onboarding or only near weight fields.
