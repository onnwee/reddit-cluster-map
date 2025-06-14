// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.29.0
// source: subreddits.sql

package db

import (
	"context"
	"database/sql"
)

const getStaleSubreddits = `-- name: GetStaleSubreddits :many
SELECT name FROM subreddits 
WHERE last_seen < NOW() - INTERVAL '7 days'
ORDER BY last_seen ASC
`

func (q *Queries) GetStaleSubreddits(ctx context.Context) ([]string, error) {
	rows, err := q.db.QueryContext(ctx, getStaleSubreddits)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []string
	for rows.Next() {
		var name string
		if err := rows.Scan(&name); err != nil {
			return nil, err
		}
		items = append(items, name)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getSubreddit = `-- name: GetSubreddit :one
SELECT id, name, title, description, subscribers, created_at, last_seen FROM subreddits WHERE name = $1
`

func (q *Queries) GetSubreddit(ctx context.Context, name string) (Subreddit, error) {
	row := q.db.QueryRowContext(ctx, getSubreddit, name)
	var i Subreddit
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Title,
		&i.Description,
		&i.Subscribers,
		&i.CreatedAt,
		&i.LastSeen,
	)
	return i, err
}

const getSubredditByID = `-- name: GetSubredditByID :one
SELECT id, name, title, description, subscribers, created_at, last_seen FROM subreddits WHERE id = $1
`

func (q *Queries) GetSubredditByID(ctx context.Context, id int32) (Subreddit, error) {
	row := q.db.QueryRowContext(ctx, getSubredditByID, id)
	var i Subreddit
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Title,
		&i.Description,
		&i.Subscribers,
		&i.CreatedAt,
		&i.LastSeen,
	)
	return i, err
}

const listSubreddits = `-- name: ListSubreddits :many
SELECT id, name, title, description, subscribers, created_at, last_seen FROM subreddits ORDER BY last_seen DESC LIMIT $1 OFFSET $2
`

type ListSubredditsParams struct {
	Limit  int32
	Offset int32
}

func (q *Queries) ListSubreddits(ctx context.Context, arg ListSubredditsParams) ([]Subreddit, error) {
	rows, err := q.db.QueryContext(ctx, listSubreddits, arg.Limit, arg.Offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Subreddit
	for rows.Next() {
		var i Subreddit
		if err := rows.Scan(
			&i.ID,
			&i.Name,
			&i.Title,
			&i.Description,
			&i.Subscribers,
			&i.CreatedAt,
			&i.LastSeen,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const touchSubreddit = `-- name: TouchSubreddit :exec
UPDATE subreddits SET last_seen = now() WHERE name = $1
`

func (q *Queries) TouchSubreddit(ctx context.Context, name string) error {
	_, err := q.db.ExecContext(ctx, touchSubreddit, name)
	return err
}

const upsertSubreddit = `-- name: UpsertSubreddit :one
INSERT INTO subreddits (name, title, description, subscribers, created_at, last_seen)
VALUES ($1, $2, $3, $4, now(), now())
ON CONFLICT (name) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  subscribers = EXCLUDED.subscribers,
  last_seen = now()
RETURNING id
`

type UpsertSubredditParams struct {
	Name        string
	Title       sql.NullString
	Description sql.NullString
	Subscribers sql.NullInt32
}

func (q *Queries) UpsertSubreddit(ctx context.Context, arg UpsertSubredditParams) (int32, error) {
	row := q.db.QueryRowContext(ctx, upsertSubreddit,
		arg.Name,
		arg.Title,
		arg.Description,
		arg.Subscribers,
	)
	var id int32
	err := row.Scan(&id)
	return id, err
}
