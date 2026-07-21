---
name: math-notation
description: "Unified mathematical notation conventions for an interactive statistics textbook built in React with KaTeX. Use this skill whenever writing, editing, or reviewing any mathematical formula, equation, definition, theorem, or notation in the textbook — including inline math, display math, component props containing formulas, and KaTeX strings in code. Also use when the user mentions notation consistency, symbol conventions, formula formatting, or asks to add a new concept that involves mathematical symbols."
---

# Mathematical Notation Conventions

This skill enforces consistent notation across all chapters of the textbook. Every formula — whether in prose, in a React component prop, or in a KaTeX render call — follows these rules.

## Rendering

- Use KaTeX for all math rendering.
- Inline math: wrap in single `$...$` or the project's inline-math component.
- Display math: wrap in `$$...$$` or the project's display-math component.
- Never use raw Unicode math symbols (∑, √, ≤) in rendered text — always use KaTeX commands (`\sum`, `\sqrt`, `\leq`).
- Line breaks in multi-line display math: use `aligned` or `cases` environments, not manual `\\` outside an environment.

## Core symbol table

These conventions are non-negotiable across all chapters. When introducing a symbol, follow this table; do not invent alternatives.

### Random variables and data

| Concept | Notation | KaTeX |
|---|---|---|
| Random variable | uppercase italic | `X`, `Y`, `Z` |
| Observed value / realization | lowercase italic | `x`, `y`, `z` |
| Sample size | n | `n` |
| Population size | N | `N` |
| i-th observation | subscript i | `x_i` |
| Vector of observations | bold lowercase | `\mathbf{x}` |
| Matrix | bold uppercase | `\mathbf{X}` |

### Central tendency and dispersion

| Concept | Notation | KaTeX |
|---|---|---|
| Population mean | μ | `\mu` |
| Sample mean | x̄ | `\bar{x}` |
| Estimator of mean | X̄ | `\bar{X}` |
| Population variance | σ² | `\sigma^2` |
| Sample variance | s² | `s^2` |
| Population std. deviation | σ | `\sigma` |
| Sample std. deviation | s | `s` |
| Standard error | SE | `\text{SE}` or `\operatorname{SE}` |

### Probability and distributions

| Concept | Notation | KaTeX |
|---|---|---|
| Probability | P(·) | `P(\cdot)` |
| Conditional probability | P(A∣B) | `P(A \mid B)` — use `\mid`, never `|` |
| Expected value | E[·] | `\mathbb{E}[\cdot]` — blackboard bold, square brackets |
| Variance operator | Var(·) | `\operatorname{Var}(\cdot)` |
| Covariance operator | Cov(·,·) | `\operatorname{Cov}(\cdot, \cdot)` |
| Correlation | Cor(·,·) or ρ | `\operatorname{Cor}(\cdot,\cdot)` or `\rho` |
| Normal distribution | N(μ, σ²) | `\mathcal{N}(\mu, \sigma^2)` — calligraphic N, parametrized by variance, not std. dev. |
| i.i.d. | i.i.d. | `\text{i.i.d.}` or `\overset{\text{i.i.d.}}{\sim}` |
| Distributed as | ~ | `\sim` |
| Converges in distribution | →d | `\xrightarrow{d}` |
| Converges in probability | →p | `\xrightarrow{p}` |

### Estimation and inference

| Concept | Notation | KaTeX |
|---|---|---|
| Estimator (hat) | θ̂ | `\hat{\theta}` |
| True parameter | θ | `\theta` |
| Null hypothesis | H₀ | `H_0` |
| Alternative hypothesis | H₁ or Hₐ | `H_1` or `H_a` — pick one per chapter, prefer `H_1` |
| p-value | p | `p\text{-value}` in prose, `p` in formulas |
| Test statistic | T or t | `T` (random variable), `t` (observed) |
| Significance level | α | `\alpha` |
| Confidence level | 1 − α | `1 - \alpha` |
| Confidence interval | CI | `\text{CI}` |
| Degrees of freedom | df | `\text{df}` or `\nu` |

### Regression

| Concept | Notation | KaTeX |
|---|---|---|
| Coefficient vector | β | `\boldsymbol{\beta}` (bold for vector) |
| Single coefficient | βⱼ | `\beta_j` |
| OLS estimate | β̂ | `\hat{\beta}_j` or `\hat{\boldsymbol{\beta}}` |
| Residual | eᵢ | `e_i` or `\hat{u}_i` — pick one, be consistent |
| Error term | uᵢ or εᵢ | `u_i` or `\varepsilon_i` — pick one per project |
| Fitted value | ŷᵢ | `\hat{y}_i` |

### Sums, products, integrals

- Always write limits explicitly for clarity:
  - `\sum_{i=1}^{n}` not `\sum_i`
  - `\prod_{i=1}^{n}` not `\prod`
  - `\int_{-\infty}^{\infty}` not `\int`
- In display math, limits go above/below (default in `$$`). In inline math, limits go to the side (default in `$`). Do not force `\limits` in inline math — it breaks line spacing.

## Formatting rules

1. **Operators vs. italic**: Functions like log, exp, max, min, argmin, Var, Cov must use `\log`, `\exp`, `\max`, `\operatorname{Var}` — never italic.
2. **Text inside math**: Labels and subscripts that are words use `\text{}`: `\beta_{\text{OLS}}`, not `\beta_{OLS}`.
3. **Parentheses scaling**: Use `\left( ... \right)` only when content is tall (fractions, sums). For simple expressions, use plain `(...)` — excessive `\left/\right` adds visual noise.
4. **Fractions**: In inline math prefer `a/b` over `\frac{a}{b}` when the fraction is simple. In display math always use `\frac{}{}`.
5. **Spacing**: Use `\,` for thin space (e.g., in integrals: `f(x)\,dx`), `\quad` for separation between conditions. Never use `\ \ ` for alignment.
6. **Numbering**: Numbered equations use a consistent scheme: `(chapter.equation)`, e.g., (3.1), (3.2). Reference with the same format.

## When introducing a new symbol

Every time a new symbol appears in a chapter for the first time:
1. State its meaning in words immediately after or before the formula.
2. Specify the domain/type (e.g., "where $n \in \mathbb{N}$").
3. If the symbol can be confused with another already used, note the distinction explicitly.

## Common mistakes to avoid

- `|` for conditional probability → use `\mid`
- `E(X)` with parentheses → use `\mathbb{E}[X]` with square brackets
- Missing `\operatorname{}` on named functions → italic "Var" reads as V·a·r
- `\sigma` for sample standard deviation → that is `s`; `\sigma` is population
- Mixing hat notation: `\hat\beta` vs `\widehat{\beta}` → always use `\hat{\theta}` for single symbols, `\widehat{SE}` for multi-letter
- `\mathbb{R}^n` without specifying n → always state the dimension or say "for all $n$"
