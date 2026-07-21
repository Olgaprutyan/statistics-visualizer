---
name: didactic-review
description: "Review textbook prose for pedagogical quality — clarity of language, logical sequencing, cognitive load, motivation, and use of examples. Use this skill whenever the user asks whether a section is understandable, well-explained, well-structured, or well-paced. Also use when the user says 'is this clear', 'does this flow', 'is this too dense', 'проверь понятность', 'проверь изложение', 'поток мысли', 'логика подачи', 'педагогика', 'как читается', or expresses doubt about whether a reader would follow the material. Trigger this in addition to stat-review whenever a chapter is being reviewed before publication — mathematical correctness and didactic quality are separate axes and both need checking."
---

# Didactic Review

This skill runs a structured pedagogical review of textbook prose. It does not check mathematical correctness (that is the `stat-review` skill's job) — it checks whether a reader would actually follow the material.

## Reader model

Assume the reader is a motivated undergraduate who has completed a first calculus course and basic probability but is meeting each new topic for the first time. They will re-read a paragraph once if it is confusing; on the second re-read they will disengage. Every design decision below is optimized for that reader.

## Review procedure

For each step, report findings as **problems** (must fix), **suggestions** (would improve), and **notes** (minor). At the end, produce a summary.

---

### Step 1: Motivation and framing

Before any technical content, the reader needs to know **why** they should care.

Check:
- Does the section open with motivation — a problem, question, or phenomenon that the material will address? Or does it dive straight into definitions?
- Is the payoff explicit? "By the end of this section, you will be able to..." or equivalent.
- Is there a connection to something the reader already cares about, from an earlier chapter or a real-world context?
- Is the target concept named early, not buried three paragraphs in?

**Red flags:**
- Opening sentence is a definition or formula
- No indication of what problem this technique solves
- "It is important to note that..." with no explanation of why it is important

---

### Step 2: Prerequisites and dependencies

Every concept used must be either (a) assumed as prerequisite, (b) defined earlier in the textbook with a reference, or (c) defined in this section before use.

Check:
- Scan every technical term. Is each one introduced before being used?
- Are references to earlier chapters/sections explicit? ("As defined in Section 2.3...") — vague references like "recall that..." without a pointer are a problem.
- Are prerequisite skills stated upfront if the section requires them (e.g., "This section assumes familiarity with matrix multiplication")?
- If a symbol from earlier is reused, is it re-glossed on first appearance in the new section, at least briefly?

**Red flags:**
- A term is used, then defined a paragraph later
- "It is easy to see that..." followed by a step that requires a non-obvious prerequisite
- Notation from an earlier chapter appears without reminder

---

### Step 3: Sequencing and flow

The order of ideas matters as much as the ideas themselves.

Check:
- **Concrete before abstract**: Is there an intuitive example or picture before the formal definition? For statistics, this often means: data example → visualization → concept → formal definition → formula.
- **One idea per paragraph**: Does each paragraph advance exactly one point? Multi-idea paragraphs increase cognitive load.
- **Transitions**: Between paragraphs and subsections, is there connective tissue explaining why we are moving to the next idea? "Now that we can estimate the mean, the next question is how accurate that estimate is..." is good; a subsection heading with no transition is worse.
- **Foreshadowing**: If a technique will be needed later, is it flagged? ("We will return to this idea when we discuss...")
- **Callbacks**: Are ideas from earlier in the chapter referenced when they become relevant again? A reader should be able to see the thread.

**Red flags:**
- Formal definition appears with no preceding example
- Two paragraphs in a row that both introduce new concepts
- A subsection ends abruptly and the next one starts on an unrelated point

---

### Step 4: Cognitive load

Even a correct, well-motivated explanation fails if it hits the reader with too much at once.

Check:
- **Chunking**: Are long derivations broken into labeled steps? A 12-line derivation with no signposts is worse than the same derivation with "Step 1: expand the square" annotations.
- **Notation density**: Are there paragraphs where new symbols are introduced faster than one per sentence? Slow it down or split it up.
- **Sentence length**: Sentences over ~30 words that contain math are usually too dense. Flag them.
- **Nested conditionals**: "If X, then unless Y, we have that when Z..." — flatten these.
- **Passive voice with buried subjects**: "It can be shown that when the sample is drawn from a distribution having finite second moment, the resulting statistic..." — rewrite in active voice with the subject up front.
- **Reader breathers**: After a technical passage, is there a sentence that lets the reader consolidate? ("So we've shown that ... — this means that ...")

**Red flags:**
- More than three new symbols in one paragraph
- Sentences that require re-reading to parse
- Long derivations with no interpretation of intermediate steps

---

### Step 5: Examples and intuition

Statistics is not learned from definitions alone.

Check:
- **Example before formalism**: Is there a worked concrete example before the general formula?
- **Example after formalism**: After the general result, is there at least one example applying it, with numbers?
- **Boundary examples**: For a definition or theorem, is there an example of what it does NOT cover? (e.g., after CLT: "note that if the variance is infinite, this fails — the Cauchy distribution is a classic counterexample")
- **Interactive tie-in**: If the section has an accompanying widget, is it referenced in the prose and clearly connected? A widget nobody is told to interact with is dead weight.
- **Numerical grounding**: When possible, are abstract quantities given concrete numerical values a reader can hold in their head? "For n = 100, this gives SE ≈ 0.1" is much stronger than "SE decreases with n".

**Red flags:**
- A theorem or definition with no example
- Examples that only illustrate the easy case, not the interesting or edge case
- Widgets that appear on the page but are not connected to the text

---

### Step 6: Language clarity

Line-level review of the writing itself.

Check:
- **Jargon**: Is every technical term glossed on first use in this chapter, even if defined elsewhere?
- **Ambiguous pronouns**: "This shows..." — what does "this" refer to? Rewrite with the noun.
- **Empty phrases**: "It is important to note", "It should be observed", "In some sense" — usually deletable.
- **Definite article traps**: "The estimator" — which estimator? Say "the sample mean estimator" if there is any risk of confusion.
- **Consistency of terminology**: Same concept called by same name throughout. If the text uses "sample average" once, "sample mean" once, and "empirical mean" once, pick one.
- **Register**: Not too formal (a textbook is not a journal article), not too casual (this is not a blog post). Aim for the voice of a good instructor talking to a curious student.

**Red flags:**
- Multiple synonyms for the same concept without acknowledgment
- Long strings of hedging ("perhaps", "in some sense", "one might say")
- Undefined pronouns referring to complex antecedents

---

### Step 7: Bilingual parity (RU/EN, if applicable)

If the section exists in both Russian and English versions:

- Do both versions cover the same content in the same order, or has one drifted?
- Are examples the same? (Numbers, variable names, scenarios)
- Are terms translated consistently across the whole textbook? Maintain a mental glossary: "confidence interval" ↔ "доверительный интервал", "estimator" ↔ "оценка", not sometimes "оценщик".
- Are there phrases that are natural in one language but awkward calques in the other? "It is known that..." translated directly to "Известно, что..." is fine; but "we have that..." → "мы имеем, что..." is a bad calque — use "получаем" or "тогда".
- Cultural adaptation: does an example that assumes a US context work in Russian? (Baseball statistics, SAT scores.) Prefer examples that translate cleanly.

---

## Output format

```
## Didactic Review: [section/file name]

### Problems (must fix)
1. [Location] — [what is wrong] — [suggested revision]

### Suggestions (would improve)
1. [Location] — [what could be better] — [how]

### Notes (minor)
1. [Location] — [observation]

### Verdict
[READY / MINOR REVISIONS / SUBSTANTIAL REVISIONS]
- Problems: [count]
- Suggestions: [count]
- Notes: [count]

### Overall impression
[2-3 sentences on the section's pedagogical strengths and weaknesses, above the level of individual line edits.]
```

Verdict rules: any problem → SUBSTANTIAL REVISIONS. Zero problems but any suggestions → MINOR REVISIONS. Zero problems and zero suggestions → READY.

## Scope calibration

- **Single paragraph or example**: run Steps 4, 5, 6 only.
- **Full section or subsection**: run all steps.
- **Full chapter**: run all steps, prioritize Steps 1, 3, 5 (motivation, flow, examples) — these matter most at chapter scale.
- **Quick check** ("быстро глянь"): Steps 3 and 6 only — flow and language. Note that the review was abbreviated.

## Interaction style when reporting

- Point to specific sentences or lines, not vague locations.
- When suggesting a revision, propose actual replacement text, not just "rewrite this".
- Do not soften. Precise, direct criticism is more useful than hedged criticism. If a paragraph is unclear, say so and show why — not "this could perhaps be slightly clearer".
- If the writing is genuinely good in some respect, say that too — but briefly, and only where it is true.
