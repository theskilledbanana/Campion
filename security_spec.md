# Leaderboard Security Specification

## Data Invariants
1. A leaderboard entry must be keyed by the user's authentic UID.
2. Users can only update their own leaderboard entry.
3. `playTime` must be a positive integer.
4. `updatedAt` must match the server timestamp.

## The "Dirty Dozen" Payloads (Deny Cases)
1. Creating an entry for another UID.
2. Updating someone else's entry.
3. Setting `playTime` to a negative value.
4. Setting `playTime` to a non-number.
5. Setting `updatedAt` to a client-side timestamp.
6. Omitting `username`.
7. Including shadow fields like `isAdmin: true`.
8. Updating `userId` after creation (identity poisoning).
9. Mass-reading all leaderboard entries without being signed in.
10. Using an ID with malicious characters.
11. Sending a payload larger than the schema allowed keys.
12. Attempting to delete someone else's entry.

## Test Strategy (Conceptual)
All write operations must pass `isValidLeaderboardEntry()` and `isOwner()`.
Read operations allow public listing but require authentication (or public read if truly global, but usually signed-in for "social" features). Let's allow public read for leaderboard visibility but scoped write.
