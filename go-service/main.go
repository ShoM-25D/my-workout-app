package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"github.com/joho/godotenv"
)

var db *pgx.Conn

type Workout struct {
	ID int `json:"id"`
	Date string `json:"date"`
	Duration int `json:"duration"`
	Notes *string `json:"notes"`
}

func main() {
	err := godotenv.Load("../.env")
	if err != nil {
		log.Println(".env file not found, using environment variables")
	}

	db, err = pgx.Connect(context.Background(), os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	defer db.Close(context.Background())

	fmt.Println("Connected to PostgreSQL!")

	r := chi.NewRouter()

	r.Get("/health", func(w http.ResponseWriter, r *http.Request){

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	})

	r.Get("/workouts", func(w http.ResponseWriter, r *http.Request){
		rows, err := db.Query(context.Background(),
		"SELECT id, date, duration, notes FROM workouts ORDER BY date DESC")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var workouts []Workout
		for rows.Next(){
			var workout Workout
			err := rows.Scan(&workout.ID, &workout.Date, &workout.Duration, &workout.Notes)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			workouts = append(workouts, workout)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(workouts)

	})

	fmt.Println("Go service running on port 8001")
	http.ListenAndServe(":8001", r)
}