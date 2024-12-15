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

## Find onboared tutors API

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

## Find tutor API

Implement a new endpoint to get tutor info [here](../../services/server/src/handlers/user.ts) (e.g., `findTutorInfo`).

##### Requirements

- The endpoint should be public.
- If the tutor is not onboarded the endpoint should respond with 404.
- User information should be retrieved from the cache when it is available.
- Get the data from the database if it is not available in the cache.

##### API Request

The endpoint should accept the tutor `id` as a param in a GET request.

##### API Response

```ts
type Response = {
  id: number;
  image: string | null;
  video: string | null; // <--- should be part of the cache.
  name: string | null;
  bio: string | null;
  about: string | null;
  topics: string[];
  studentCount: number;
  lessonCount: number;
  avgRating: number;
  rules: IRule.RuleEvents[];
};
```

## Tutor manager

Tutor manager is currently kown as _interviewer_. His responsibility was to interview make interviews with tutors.

We would like to extend his responsibilities to be able to do the following:

1. Making interviews with tutors.
2. Give lessons (as if he is a tutor) when he is not occupied with the interviews.
3. Write articles for the LiteSpace blogs (out of the scope of this sprint)

To achieve this we will:

1. Introduce a new use role and call it `tutor-manager`.
2. Slowly removing the `interviewer` role. (we will work backward frontend -> backend -> models -> database)
3. Update the create user api handler at [handlers/user.ts](../../services/server/src/handlers/user.ts).
4. Tutor manager will have the full information as regular tutor (his extra information should be part of the `tutors` table.)
5. Update the seed script to create multiple tutor managers.

## Find tutor rules API

Note: the api handler is partially implemented. `findUnpackedUserRules` at [handlers/rule.ts](../../services/server/src/handlers/rule.ts)

##### API Request

- `id` (required) - the target tutor id.
- `after` & `before` (required) - ISO UTC datetime.
  - Rules that are _completely or partially_ between `after` and `before` will be included in the response.
  - The max difference between `after` & `before` will be 60 days.

##### Requirements

- Respond with 404 incase tutor is not found or it is not fully onboarded.
- The `id` provided in the request should be the id of a `tutor` or a `tutor-manager`

##### API Response

```ts
type Response = {
  rules: IRule.Self[];
  slots: IRule.Slots[];
};
```

## Find tutor ratings API

**NOTE:** impl. new endpoint if needed.

##### Requirements

- It should be public.
- It should support pagination (page/size).
- Ratings order:
  1. If the current user (who is making the request) is a student, his rating **must** be at the top of the ratings list in the response.
  2. Then order by **high rating value**.
  3. Then order by **feedback (long feedback is preferred over short ones, short feedback is preferred over none)**.
     - in future versions, LLM Models (e.g., Gemini) will be used to perform semantic analysis over the feedback text thus enables us to filter out inappropriate feedback and make good feedback at the top.
  4. Then order by recent ratings (recent ratings should come before old ratings).

##### API Request

- `id` (required) - the target tutor id.
- `page` & `size` (optional) - use for pagination.

##### API Response

```ts
type Response = Paginated<{
  /**
   * Rating id.
   */
  id: number;
  /**
   * Student id.
   */
  userId: number;
  /**
   * Student image.
   */
  image: string | null;
  /**
   * Student name.
   */
  name: string | null;
  /**
   * Rating value between 1-5.
   */
  value: number;
  /**
   * Rating feedback text.
   */
  feedback: string | null;
}>;
```

## Tasks

- [x] Update the tutors cache according to the [new design](#cache-strucutre). [@mmoehabb](https://github.com/mmoehabb)
- [x] Update [`findOnboardedTutors`](/services/server/src/handlers/user.ts) handler to response with [this](#find-onboared-tutors-api)
- [x] Search tutors by name and topics.
  - API should accept a `keyword` as a query param and filter tutors according to it.
- [ ] Impl. `tutor-manager` user role ([info](#tutor-manager)). [@mmoehabb](https://github.com/mmoehabb)
  - [x] Update the database models to include the new role `tutor-manager`.
  - [x] Update the `create` user api handler.
  - [x] Update the `update` user api handler.
  - [x] Tutor managers should be part of the tutors cache.
  - [x] Update the seed script to create multiple tutor managers.
  - [x] Remove the `interviewer` from the client (`nova` and `dashboard`)
  - [ ] Remove the `interviewer` from the server, models, and database.
  - [ ] Remove the `interviewer` from the the remaining packages.
- [x] Explain how `rrules` works. [@neuodev](https://github.com/neuodev)
- [x] Impl. _book a lesson dialog_ [@neuodev](https://github.com/neuodev)
- [x] Rating (or updating a rate) for the tutor [@moalidv](https://github.com/moalidv)
  - [x] Update the rating card design.
    - Add actions (edit and delete).
    - Display rating starts.
- [x] Impl. video player [@mostafakamar2308](https://github.com/mostafakamar2308)
- [x] Update the find tutor info API ([info](#find-tutor-api)). [@mmoehabb](https://github.com/mmoehabb)
- [x] Write tests for the ratings endpoints. [@mmoehabb](https://github.com/mmoehabb)
- [x] Put all pieces together at the tutor profile page [@mostafakamar2308](https://github.com/mostafakamar2308)
- [x] Update the find tutor rules api ([info](#find-tutor-rules-api)) (with tests) [@mmoehabb](https://github.com/mmoehabb)
- [x] Impl. find tutor ratings endpoint ([info](#find-tutor-ratings-api)) [@mmoehabb](https://github.com/mmoehabb)
