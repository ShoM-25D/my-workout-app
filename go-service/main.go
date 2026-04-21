package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/golang-jwt/jwt/v5"
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
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{"http://localhost:3000"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Authorization", "Content-Type"},
	}))

	r.Get("/health", func(w http.ResponseWriter, r *http.Request){

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	})

	r.With(authMiddleware).Get("/workouts", func(w http.ResponseWriter, r *http.Request){
		userID := r.Context().Value("userID").(string)
		rows, err := db.Query(context.Background(),
		"SELECT id, date, duration, notes FROM workouts WHERE user_id = $1 ORDER BY date DESC", userID)
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

func authMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			http.Error(w, "認証トークンがありません", http.StatusUnauthorized)
			return
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		secretKey := os.Getenv("SECRET_KEY")

		token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
			return []byte(secretKey), nil
		})

		if err != nil || !token.Valid {
			http.Error(w, "無効なトークンです", http.StatusUnauthorized)
			return
		}

		claims := token.Claims.(jwt.MapClaims)
		userID := claims["sub"].(string)
		ctx := context.WithValue(r.Context(), "userID", userID)
		next.ServeHTTP(w,r.WithContext(ctx))
	})
}