package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/onnwee/reddit-cluster-map/backend/internal/db"
)

func GetSubreddits(q *db.Queries) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		subs, err := q.ListSubreddits(r.Context(), db.ListSubredditsParams{})
		if err != nil {
			http.Error(w, "Failed to fetch subreddits", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)

		if err := json.NewEncoder(w).Encode(subs); err != nil {
			http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		}
	}
}