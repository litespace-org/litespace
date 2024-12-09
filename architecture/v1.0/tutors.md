# Backend

## Tutors cache

### Cache strucutre

1. Tutor information - only cache required fields to reduce the cache size.

   - `id`
   - `name`
   - `image`
   - `bio`
   - `about`
   - `gender` - used for sorting tutors (match between genders)
   - `online` - used for sortint tutors (online tutors comes first)
   - `notice` - used for sorting tutors (short notice period comes first)
   - `topics` (`string[]`) - used for sorting and filtering (tutors with the same interests as the student comes first).
   - `avgRating` - used for sorting. (tutors with high rating comes first)
   - `studentCount` - used for sorting (tutors with high student count comes first)
   - `lessonCount` - used for sorting (tutors with high lesson count comes first)

2. Tutor rules.

### Find onboared tutors API

```ts
type Response = Paginated<{
  id: number;
  image: string | null;
  name: string | null;
  bio: string | null;
  about: string | null;
  topics: string[];
  studentCount: number;
  lessonCount: number;
  avgRating: number;
  rules: IRule.RuleEvents[];
}>;
```

### Tasks

- [x] Update the tutors cache according to the [new design](#cache-strucutre). [@mmoehabb](https://github.com/mmoehabb)
- [x] Update [`findOnboardedTutors`](/services/server/src/handlers/user.ts) handler to response with [this](#find-onboared-tutors-api)
- [ ] Search tutors by name and topics.
      -API should accept a `keywoard` as a query param and filter tutors according to it.
- [ ] Impl. `tutor-manager` user role.
