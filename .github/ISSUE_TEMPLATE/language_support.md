---
name: Language Support Request
about: Request support for a new programming language or file type
title: '[LANGUAGE] Add support for '
labels: 'enhancement, language-support'
assignees: 'HenraL'

---

## Language Support Request

**Language/File Type**
<!-- e.g., Julia, Dart, Fortran, .proto files, etc. -->

**Language Information**

- **Official Website**:
- **File Extensions**: <!-- e.g., .jl, .dart, .f90 -->
- **VS Code Language ID**: <!-- Check with Command Palette > "Change Language Mode" -->

**Comment Syntax**
<!-- Provide examples of how comments work in this language -->

**Single-line comments:**

```
// Example single-line comment
```

**Multi-line comments:**

```
/*
 * Example multi-line comment
 */
```

**Documentation comments** (if different):

```
/// Example documentation comment
```

**Use Case**
<!-- Describe why you need AsperHeader support for this language -->

**Current Workaround**
<!-- If you've found a temporary solution, share it here -->

**Example Header**
<!-- Show what an ideal header would look like in this language -->

```language-name
[Paste example of desired header here]
```

**Popularity/Relevance**
<!-- Help us prioritize: Is this widely used? Part of a specific ecosystem? -->

**Additional Context**
<!-- Any special considerations, edge cases, or requirements -->

---

**Checklist for Implementation** (for maintainers):

- [ ] Add language to `languages.json`
- [ ] Test comment detection
- [ ] Test header generation
- [ ] Test header refresh
- [ ] Update documentation
- [ ] Add test case
