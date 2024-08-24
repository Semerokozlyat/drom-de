package main

import (
	"context"
	"encoding/json"
	"io"
	"log"
	"net"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	mongoOptions "go.mongodb.org/mongo-driver/mongo/options"
)

const (
	EnvServerPort   = "SERVER_PORT"
	EnvDBConnString = "DB_CONN_STRING"
)

type Config struct {
	ServerPort   string `json:"server_port" yaml:"serverPort"`
	DBConnString string `json:"db_conn_string" yaml:"dbConnString"`
}

func InitConfig() Config {
	srvPort := os.Getenv(EnvServerPort)
	if srvPort == "" {
		srvPort = "4040"
	}
	dbConnString := os.Getenv(EnvDBConnString)
	if dbConnString == "" {
		dbConnString = "mongodb://root:root@127.0.0.1"
	}

	return Config{
		ServerPort:   srvPort,
		DBConnString: dbConnString,
	}
}

func newDatabaseClient(ctx context.Context, cfg Config) (client *mongo.Client, err error) {
	clientOptions := mongoOptions.Client().ApplyURI(cfg.DBConnString)
	client, err = mongo.Connect(ctx, clientOptions)
	if err != nil {
		return nil, err
	}
	err = client.Ping(ctx, nil)
	if err != nil {
		return nil, err
	}
	log.Println("Connected to MongoDB")
	return client, nil
}

func initDBCollections(client *mongo.Client, dbName string) *mongo.Collection {
	collection := client.Database(dbName).Collection("todos")
	return collection
}

type TODOList struct {
	Items []TODO `json:"items"`
}

type TODO struct {
	ID        primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	Completed bool               `json:"completed"`
	Body      string             `json:"body"`
}

type GetTodosHandler struct {
	todosCollection *mongo.Collection
}

func NewGetTodosHandler(todosCollection *mongo.Collection) *GetTodosHandler {
	return &GetTodosHandler{
		todosCollection: todosCollection,
	}
}

func (h *GetTodosHandler) ServeHTTP(rw http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	todoList := TODOList{
		Items: make([]TODO, 0, 100),
	}
	cursor, err := h.todosCollection.Find(ctx, bson.M{})
	if err != nil {
		log.Printf("failed to fetch TODOs from storage: %s", err)
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)
	for cursor.Next(ctx) {
		var todo TODO
		dErr := cursor.Decode(&todo)
		if dErr != nil {
			log.Printf("failed to decode TODO item: %s", err)
			rw.WriteHeader(http.StatusBadRequest)
			return
		}
		todoList.Items = append(todoList.Items, todo)
	}
	respBody, err := json.Marshal(todoList)
	if err != nil {
		log.Printf("failed to marshal response: %s", err)
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}
	rw.Header().Set("Content-Type", "application/json")
	rw.WriteHeader(http.StatusOK)
	_, _ = rw.Write(respBody)
}

type CreateTodoHandler struct {
	todosCollection *mongo.Collection
}

func NewCreateTodoHandler(todosCollection *mongo.Collection) *CreateTodoHandler {
	return &CreateTodoHandler{
		todosCollection: todosCollection,
	}
}

func (h *CreateTodoHandler) ServeHTTP(rw http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
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
	insertResult, err := h.todosCollection.InsertOne(ctx, todoItem)
	if err != nil {
		log.Printf("failed to insert todo item into DB: %s", err)
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	todoItem.ID = insertResult.InsertedID.(primitive.ObjectID)

	respBody, err := json.Marshal(todoItem)
	if err != nil {
		log.Printf("failed to marshal response: %s", err)
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	rw.Header().Set("Content-Type", "application/json")
	rw.WriteHeader(http.StatusCreated)
	_, _ = rw.Write(respBody)
}

type UpdateTodoHandler struct {
	todosCollection *mongo.Collection
}

func NewUpdateTodoHandler(todosCollection *mongo.Collection) *UpdateTodoHandler {
	return &UpdateTodoHandler{
		todosCollection: todosCollection,
	}
}

func (h *UpdateTodoHandler) ServeHTTP(rw http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	todoIDStr := chi.URLParam(r, "todoID")
	todoObjID, err := primitive.ObjectIDFromHex(todoIDStr)
	if err != nil {
		log.Printf("TODO ID must be valid: %s", err)
		rw.WriteHeader(http.StatusBadRequest)
		return
	}

	filter := bson.M{"_id": todoObjID}
	update := bson.M{"$set": bson.M{"completed": true}}
	_, err = h.todosCollection.UpdateOne(ctx, filter, update)
	if err != nil {
		log.Printf("failed to update TODO item in DB: %s", err)
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	respBody, err := json.Marshal(todoObjID)
	if err != nil {
		log.Printf("failed to marshal response: %s", err)
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	rw.Header().Set("Content-Type", "application/json")
	rw.WriteHeader(http.StatusOK)
	_, _ = rw.Write(respBody)
}

type DeleteTodoHandler struct {
	todosCollection *mongo.Collection
}

func NewDeleteTodoHandler(todosCollection *mongo.Collection) *DeleteTodoHandler {
	return &DeleteTodoHandler{
		todosCollection: todosCollection,
	}
}

func (h *DeleteTodoHandler) ServeHTTP(rw http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	todoIDStr := chi.URLParam(r, "todoID")
	todoObjID, err := primitive.ObjectIDFromHex(todoIDStr)
	if err != nil {
		log.Printf("TODO ID must be valid: %s", err)
		rw.WriteHeader(http.StatusBadRequest)
		return
	}

	filter := bson.M{"_id": todoObjID}
	_, err = h.todosCollection.DeleteOne(ctx, filter)
	if err != nil {
		log.Printf("failed to delete TODO item from DB: %s", err)
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}
	rw.Header().Set("Content-Type", "application/json")
	rw.WriteHeader(http.StatusOK)
}

func main() {
	router := chi.NewRouter()
	router.Use(middleware.RequestID)
	router.Use(middleware.Logger)
	router.Use(middleware.Recoverer)
	router.Use(cors.Handler(cors.Options{
		// AllowedOrigins:   []string{"https://foo.com"}, // Use this to allow specific origin hosts
		AllowedOrigins: []string{"https://*", "http://*"},
		// AllowOriginFunc:  func(r *http.Request, origin string) bool { return true },
		AllowedMethods:   []string{"GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "Origin"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	}))

	cfg := InitConfig()
	dbClient, err := newDatabaseClient(context.Background(), cfg)
	if err != nil {
		log.Fatalf("failed to create Mongo DB client: %s", err)
	}

	ctx := context.Background()
	defer dbClient.Disconnect(ctx) // TODO: move to server shutdown phase
	todosCollection := initDBCollections(dbClient, "todos_db")

	router.Get("/api/todos", NewGetTodosHandler(todosCollection).ServeHTTP)
	router.Post("/api/todos", NewCreateTodoHandler(todosCollection).ServeHTTP)
	router.Patch("/api/todos/{todoID}", NewUpdateTodoHandler(todosCollection).ServeHTTP)
	router.Delete("/api/todos/{todoID}", NewDeleteTodoHandler(todosCollection).ServeHTTP)

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
