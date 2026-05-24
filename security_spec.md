# Forum Security Specification

## Data Invariants
- A post must have a non-empty title and content.
- A comment must have non-empty content and a valid `postId`.
- `authorId` must strictly match the authenticated user's UID.
- `createdAt` must be the server timestamp.
- Likes can only be incremented or decremented (not directly set to arbitrary values).

## The Dirty Dozen (Vulnerability Test Payloads)

1. **Identity Spoofing (Create Post)**: Setting `authorId` to another user's UID.
2. **Identity Spoofing (Update Post)**: Changing the `authorId` of an existing post.
3. **Identity Spoofing (Create Comment)**: Setting `authorId` to another user's UID in a comment.
4. **Malicious Content (Long Title)**: Creating a post with a 1MB title.
5. **Malicious Content (Long Content)**: Creating a post with 10MB content.
6. **Unauthorized Delete (Post)**: User A deleting User B's post.
7. **Unauthorized Update (Comment)**: User A editing User B's comment.
8. **Invalid State (Negative Likes)**: Setting `likes` to -100.
9. **Orphaned Comment**: Creating a comment for a post that doesn't exist.
10. **Timestamp Forgery**: Providing a manual `createdAt` date instead of server timestamp.
11. **Shadow Field Injection**: Adding an `isAdmin: true` field to a post.
12. **Blanket Query Scraping**: Attempting to list all posts without being signed in (if forbidden).

## Test Runner (Logic Check)
The rules will enforce:
- `isValidId(postId)` and `isValidId(commentId)`
- `isValidPost(incoming())` and `isValidComment(incoming())`
- `isOwner(existing().authorId)` for updates and deletes.
- `exists(/databases/$(database)/documents/forum_posts/$(incoming().postId))` for comments.
