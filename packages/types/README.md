# LiteSpace Monorepo Types

This package contains all major types related to different components/packages of LiteSpace. All 'ts' files in this package exports either types or enums, or both. Those files can be taxonomized into two categories: _Entity Types Files_ and _Hardcode Config Files_.

## Entity Types Files

These are the files that define at least the structure of each data entity or data model in two different type names: _Row_ and _Self_ (e.g. `src/gift.ts`). The first represents the data as it would look like when retrieved from the database, whereas the latter represents/structures it as it shall be used by different parts of the software.

## Hardcode Config Files

These files contain hardcoded values that may be used across different parts of LiteSpace packages. It bestows on LiteSpace more flexible architecture and code base. (e.g. `src/verification.ts`)
