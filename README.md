# tskPay — Product Design Package

This package contains everything needed to implement tskPay, an internal financial management application for a ski-running club.

## Quick Start

1. **Read the overview:** Start with `product-overview.md` to understand the product
2. **Choose your approach:**
   - **One-shot:** Use `prompts/one-shot-prompt.md` with `instructions/one-shot-instructions.md` for full implementation
   - **Incremental:** Use `prompts/section-prompt.md` with `instructions/incremental/` for milestone-by-milestone implementation
3. **Follow TDD:** Each section includes `tests.md` with test-writing instructions — write tests first, then implement

## What's Included

- **Ready-to-use prompts** — Copy/paste into your coding agent
- **Implementation instructions** — Detailed guides for each milestone
- **React components** — Fully styled, props-based, production-ready
- **TypeScript types** — Complete type definitions
- **Design system** — Colors, typography, tokens
- **Data model** — Entity definitions and relationships
- **Test instructions** — Framework-agnostic TDD specs
- **Screenshots** — Visual references for each section

## Structure

```
product-plan/
├── README.md                    # This file
├── product-overview.md          # Product summary (always provide)
│
├── prompts/                     # Ready-to-use prompts
│   ├── one-shot-prompt.md       # Full implementation prompt
│   └── section-prompt.md        # Incremental implementation prompt
│
├── instructions/                # Implementation guides
│   ├── one-shot-instructions.md # All milestones combined
│   └── incremental/             # Milestone-by-milestone
│       ├── 01-foundation.md
│       ├── 02-clani-in-skupine.md
│       ├── 03-stroski-in-obracunavanje.md
│       ├── 04-placila-in-bancni-uvoz.md
│       └── 05-pregled-in-porocila.md
│
├── design-system/               # Design tokens
├── data-model/                  # Type definitions
├── shell/                       # Application shell components
└── sections/                    # Section components
    ├── clani-in-skupine/
    ├── stroski-in-obracunavanje/
    ├── placila-in-bancni-uvoz/
    └── pregled-in-porocila/
```

## Important Notes

- **Components are props-based** — They accept data and callbacks via props, never import data directly
- **Use TDD** — Write tests first using the provided `tests.md` instructions
- **Don't redesign** — Use components as-is, focus on backend and data integration
- **Always provide** `product-overview.md` with any implementation session

## Next Steps

1. Review `product-overview.md`
2. Choose your implementation approach (one-shot or incremental)
3. Start with the foundation milestone
4. Follow the test-driven development workflow for each section

