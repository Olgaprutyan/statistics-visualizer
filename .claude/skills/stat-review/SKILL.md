---
name: stat-review
description: "Review statistical claims, formulas, code, and interactive demos in the textbook for correctness. Use this skill whenever the user asks to review, check, audit, or proofread any chapter, section, widget, or component — especially before committing or publishing. Also use when the user says 'review this', 'check the math', 'is this correct', 'sanity check', 'проверь', 'ревью', or any variant implying quality assurance of statistical content. Trigger even if the user only asks to review code — statistical code can contain silent correctness bugs that a pure code review would miss."
---

# Statistical Correctness Review

This skill runs a structured review of textbook content — prose, formulas, and code — checking for statistical errors, pedagogical problems, and inconsistencies. It is designed for an interactive statistics textbook in React.

## Review procedure

When triggered, follow these steps in order. For each step, report findings grouped as **errors** (must fix), **warnings** (likely problem), and **notes** (style / could be better). At the end, produce a summary table.

---

### Step 1: Mathematical correctness

Go through every formula in the reviewed content and check:

**Definitions and theorems**
- Is the statement mathematically correct?
- Are all conditions stated? (e.g., CLT requires finite variance; LLN requires i.i.d. — are these mentioned?)
- Are edge cases acknowledged? (n = 1, degenerate distributions, zero variance)

**Derivations**
- Does each step follow from the previous one?
- Are there implicit simplifications that should be made explicit? (e.g., "assuming σ is known", "for large n")
- Is the final result correct? Verify by substituting a simple example where the answer is known.

**Formulas**
- Verify index ranges: does the sum start at 0 or 1? Is it ≤ n or < n?
- Check denominators: n vs. n − 1 (population vs. sample variance). Make sure the text matches which one is being used.
- Check signs: subtraction order in residuals (yᵢ − ŷᵢ, not ŷᵢ − yᵢ for standard residuals).
- Verify normalizing constants in density functions.
- If a formula has a known name (Bayes' theorem, CLT, Slutsky's theorem), compare with the standard form and flag any deviation.

**Common formula errors to specifically watch for:**
- Sample variance with 1/n instead of 1/(n−1) when claiming unbiasedness
- Mixing up SE = s/√n with σ/√n (known vs. estimated)
- Wrong degrees of freedom in t-distribution (n−1 for one-sample, n−2 for simple regression, n−k−1 for multiple regression)
- Confidence interval ± direction errors (x̄ ± t·SE, not x̄ ± z·s)
- Off-by-one errors in order statistics, quantiles, or percentile calculations
- Forgetting to square in chi-squared test statistic
- Misapplied log rules: log(a+b) ≠ log(a) + log(b)
- Wrong Jacobian or transformation in change-of-variables

---

### Step 2: Code–formula agreement

If the content includes JavaScript/React code for simulations or interactive widgets:

1. **Identify every formula implemented in code** — extract the mathematical expression the code is computing.
2. **Compare code to the formula in the text**. Common mismatches:
   - Text says population variance (1/n), code uses sample variance (1/(n−1)), or vice versa
   - Text defines an estimator with one formula, simulation uses a different one
   - Random number generation uses wrong distribution or wrong parameters (e.g., `Math.random()` is uniform, not normal)
   - Off-by-one in loops: `for (let i = 0; i < n; ...)` vs. `for (let i = 1; i <= n; ...)`
3. **Check simulation methodology**:
   - Is the sample size large enough for the demo to be convincing?
   - Is the number of replications sufficient? (Rule of thumb: ≥ 1000 for distribution demos, ≥ 10000 for convergence demos)
   - Is the random seed set for reproducibility, or is each run truly random? Both are valid, but the choice should be intentional.
   - Are extreme values handled? (e.g., division by zero when s = 0 in a tiny sample)
4. **Check visualizations**:
   - Do axes have correct labels matching the formula's notation?
   - Is the y-axis a density or a frequency? Does the label match?
   - Are histogram bins reasonable (not too many, not too few for the sample size)?
   - Does an overlay (e.g., theoretical PDF on top of a histogram) use the correct parameters?

---

### Step 3: Pedagogical and language review

1. **Causal language**: Flag any causal claim not backed by an experimental/quasi-experimental design. "X causes Y" from observational data is an error; "X is associated with Y" is correct.
2. **p-value interpretation**: The p-value is NOT the probability that H₀ is true. Flag any statement implying P(H₀|data). Correct: "the probability of observing data at least as extreme as this, assuming H₀ is true."
3. **Confidence interval interpretation**: A 95% CI does NOT mean "95% probability that the true parameter is in this interval." Flag this. Correct: "if we repeated the procedure many times, 95% of the constructed intervals would contain the true parameter."
4. **Significance vs. importance**: Flag any conflation of statistical significance with practical importance or effect size.
5. **"Proves" / "proof"**: Statistical evidence does not prove hypotheses. Flag uses of "prove" outside of mathematical proof contexts. Prefer "evidence for/against", "consistent with", "suggests".
6. **Sampling language**: "Random sample" must refer to a defined sampling mechanism. Flag vague "we take a random sample" without specifying from what population.
7. **Assumptions stated**: For every procedure (t-test, regression, bootstrap), check that the assumptions required are explicitly listed (not just the formula).

---

### Step 4: Notation consistency

Cross-reference the `math-notation` skill if it is available. Otherwise check:

- Same symbol means same thing across the entire reviewed section
- Estimators have hats, population parameters do not
- `\mid` for conditional probability, not `|`
- `\mathbb{E}[·]` with square brackets, not parentheses
- Named operators use `\operatorname{}` or `\text{}`
- Sum/product limits are explicit

---

### Step 5: Internal consistency

- If the section references a result from another chapter, verify the reference is correct (chapter/section number, theorem number).
- If the section shows a widget that "demonstrates" a theorem, check that the widget's behavior actually matches the theorem's claim.
- If data or examples carry over between subsections, check that numbers are consistent (the same dataset should yield the same mean everywhere it's mentioned).

---

## Output format

After the review, produce a summary:

```
## Review Summary: [section/file name]

### Errors (must fix)
1. [Location] — [description of error] — [suggested fix]

### Warnings (likely problem)
1. [Location] — [description] — [suggestion]

### Notes (style/improvement)
1. [Location] — [description]

### Verdict
[PASS / PASS WITH WARNINGS / NEEDS REVISION]
- Errors: [count]
- Warnings: [count]
- Notes: [count]
```

If there are zero errors and zero warnings, the verdict is PASS. If there are warnings but no errors, PASS WITH WARNINGS. Any error means NEEDS REVISION.

## Scope calibration

- **Single component/widget**: run all 5 steps on that component.
- **Full chapter**: run all 5 steps, but in Step 2 prioritize components with simulation logic.
- **Quick check** (user says "quick review" / "быстро глянь"): run Steps 1 and 2 only, skip the rest, note that it was an abbreviated review.
- **Pre-commit review**: run all 5 steps; this is the full review before code goes live.
