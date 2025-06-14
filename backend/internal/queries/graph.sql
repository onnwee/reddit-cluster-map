-- name: GetPrecalculatedGraphData :many
SELECT
    'node' as data_type,
    id,
    name,
    val::TEXT as val,
    type,
    NULL as source,
    NULL as target
FROM graph_nodes
UNION ALL
SELECT
    'link' as data_type,
    id::text,
    NULL as name,
    NULL::TEXT as val,
    NULL as type,
    source,
    target
FROM graph_links
ORDER BY data_type, id;

-- name: GetAllPosts :many
SELECT id, title, score
FROM posts;

-- name: GetAllComments :many
SELECT id, body, score, post_id
FROM comments;

-- name: CreateGraphNode :one
INSERT INTO graph_nodes (
    id,
    name,
    val,
    type
) VALUES (
    $1, $2, $3, $4
) RETURNING *;

-- name: CreateGraphLink :one
INSERT INTO graph_links (
    source,
    target
) VALUES (
    $1, $2
) RETURNING *;

-- name: ClearGraphTables :exec
TRUNCATE TABLE graph_nodes, graph_links;

-- name: BulkInsertGraphNode :exec
INSERT INTO graph_nodes (id, name, val, type)
VALUES ($1, $2, $3, $4);

-- name: BulkInsertGraphLink :exec
INSERT INTO graph_links (source, target)
VALUES ($1, $2);

-- name: GetAllSubreddits :many
SELECT id, name, subscribers
FROM subreddits;

-- name: GetAllUsers :many
SELECT id, username
FROM users;

-- name: GetSubredditOverlap :one
WITH user_activity AS (
    SELECT DISTINCT p.author_id
    FROM posts p
    WHERE p.subreddit_id = $1
    UNION
    SELECT DISTINCT c.author_id
    FROM comments c
    WHERE c.subreddit_id = $1
),
other_activity AS (
    SELECT DISTINCT p.author_id
    FROM posts p
    WHERE p.subreddit_id = $2
    UNION
    SELECT DISTINCT c.author_id
    FROM comments c
    WHERE c.subreddit_id = $2
)
SELECT COUNT(*)
FROM user_activity ua
JOIN other_activity oa ON ua.author_id = oa.author_id;

-- name: CreateSubredditRelationship :one
INSERT INTO subreddit_relationships (
    source_subreddit_id,
    target_subreddit_id,
    overlap_count
) VALUES (
    $1, $2, $3
) RETURNING *;

-- name: ClearSubredditRelationships :exec
TRUNCATE TABLE subreddit_relationships;

-- name: GetUserSubreddits :many
SELECT DISTINCT s.id, s.name
FROM subreddits s
JOIN posts p ON p.subreddit_id = s.id
WHERE p.author_id = $1
UNION
SELECT DISTINCT s.id, s.name
FROM subreddits s
JOIN comments c ON c.subreddit_id = s.id
WHERE c.author_id = $1;

-- name: GetUserSubredditActivityCount :one
SELECT (
    (SELECT COUNT(*) FROM posts p WHERE p.author_id = $1 AND p.subreddit_id = $2) +
    (SELECT COUNT(*) FROM comments c WHERE c.author_id = $1 AND c.subreddit_id = $2)
) as activity_count;

-- name: CreateUserSubredditActivity :one
INSERT INTO user_subreddit_activity (
    user_id,
    subreddit_id,
    activity_count
) VALUES (
    $1, $2, $3
) RETURNING *;

-- name: ClearUserSubredditActivity :exec
TRUNCATE TABLE user_subreddit_activity;

-- name: GetAllSubredditRelationships :many
SELECT source_subreddit_id, target_subreddit_id, overlap_count
FROM subreddit_relationships;

-- name: GetAllUserSubredditActivity :many
SELECT user_id, subreddit_id, activity_count
FROM user_subreddit_activity;

-- name: GetUserTotalActivity :one
SELECT (
    (SELECT COUNT(*) FROM posts p WHERE p.author_id = $1) +
    (SELECT COUNT(*) FROM comments c WHERE c.author_id = $1)
) as total_activity; 