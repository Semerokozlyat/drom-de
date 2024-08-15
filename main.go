package main

import (
	"encoding/json"
	"io"
	"log"
	"net"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

const (
	EnvServerPort = "SERVER_PORT"
)

type Config struct {
	ServerPort string `json:"server_port" yaml:"serverPort"`
}

func InitConfig() Config {
	srvPort := os.Getenv(EnvServerPort)
	if srvPort == "" {
		srvPort = "4040"
	}

	return Config{
		ServerPort: srvPort,
	}
}

var storage = make([]TODO, 0, 100)

type TODOList struct {
	Items []TODO `json:"items"`
}

type TODO struct {
	ID        int    `json:"id"`
	Completed bool   `json:"completed"`
	Body      string `json:"body"`
}

func main() {
	router := chi.NewRouter()
	router.Use(middleware.RequestID)
	router.Use(middleware.Logger)
	router.Use(middleware.Recoverer)

	router.Get("/api/todos", func(rw http.ResponseWriter, r *http.Request) {
		todoItems := TODOList{
			Items: storage,
		}
		respBody, err := json.Marshal(todoItems)
		if err != nil {
			log.Printf("failed to marshal response: %s", err)
			rw.WriteHeader(http.StatusInternalServerError)
			return
		}
		rw.Header().Set("Content-Type", "application/json")
		rw.WriteHeader(http.StatusOK)
		_, _ = rw.Write(respBody)
	})

	router.Post("/api/todos", func(rw http.ResponseWriter, r *http.Request) {
		b, err := io.ReadAll(r.Body)
		if err != nil {
			log.Printf("failed to read request body: %s", err)
			rw.WriteHeader(http.StatusInternalServerError)
			return
		}
		var todoItem TODO
		err = json.Unmarshal(b, &todoItem)
		if err != nil {
			log.Printf("failed to unmarshal TODO item: %s", err)
			rw.WriteHeader(http.StatusBadRequest)
			return
		}
		todoItem.ID = len(storage) + 1
		storage = append(storage, todoItem)

		respBody, err := json.Marshal(todoItem)
		if err != nil {
			log.Printf("failed to marshal response: %s", err)
			rw.WriteHeader(http.StatusInternalServerError)
			return
		}

		rw.Header().Set("Content-Type", "application/json")
		rw.WriteHeader(http.StatusCreated)
		_, _ = rw.Write(respBody)
	})

	router.Patch("/api/todos/{todoID}", func(rw http.ResponseWriter, r *http.Request) {
		todoIDStr := chi.URLParam(r, "todoID")
		todoID, err := strconv.Atoi(todoIDStr)
		if err != nil {
			log.Printf("TODO ID must be a number: %s", err)
			rw.WriteHeader(http.StatusBadRequest)
			return
		}

		var foundItemIdx = -1
		for i := range storage {
			if storage[i].ID == todoID {
				foundItemIdx = i
				storage[i].Completed = true
			}
		}
		if foundItemIdx == -1 {
			log.Printf("TODO with ID %s is not found", todoIDStr)
			rw.WriteHeader(http.StatusNotFound)
			return
		}
		respBody, err := json.Marshal(storage[foundItemIdx])
		if err != nil {
			log.Printf("failed to marshal response: %s", err)
			rw.WriteHeader(http.StatusInternalServerError)
			return
		}

		rw.Header().Set("Content-Type", "application/json")
		rw.WriteHeader(http.StatusOK)
		_, _ = rw.Write(respBody)
	})

	router.Delete("/api/todos/{todoID}", func(rw http.ResponseWriter, r *http.Request) {
		todoIDStr := chi.URLParam(r, "todoID")
		todoID, err := strconv.Atoi(todoIDStr)
		if err != nil {
			log.Printf("TODO ID must be a number: %s", err)
			rw.WriteHeader(http.StatusBadRequest)
			return
		}

		var foundItemIdx = -1
		for i := range storage {
			if storage[i].ID == todoID {
				foundItemIdx = i
				storage = append(storage[:i], storage[i+1:]...)
			}
		}
		if foundItemIdx == -1 {
			log.Printf("TODO with ID %s is not found", todoIDStr)
			rw.WriteHeader(http.StatusNotFound)
			return
		}
		rw.WriteHeader(http.StatusOK)
	})

	cfg := InitConfig()

	srv := &http.Server{
		Addr:              ":" + cfg.ServerPort,
		WriteTimeout:      60 * time.Second,
		ReadTimeout:       5 * time.Second,
		ReadHeaderTimeout: 5 * time.Second,
		IdleTimeout:       30 * time.Second,
		Handler:           router,
	}

	listener, err := net.Listen("tcp", srv.Addr)
	if err != nil {
		panic(err)
	}

	log.Printf("HTTP server is working on %s", srv.Addr)
	err = srv.Serve(listener)
	if err != nil {
		log.Fatalf("failed to start HTTP server: %s", err)
	}
}
