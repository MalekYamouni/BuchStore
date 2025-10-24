package app

import (
	"bookbazaar-backend/internal/handlers"
	"bookbazaar-backend/internal/middleware"
	"bookbazaar-backend/internal/repository"
	"bookbazaar-backend/internal/services"
	"database/sql"
	"log"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/jackc/pgx/v5/stdlib"
)

func Run() {
	db, err := sql.Open("pgx", "postgresql://postgres:Gurkenwasser451995!.@localhost:5432/bookbazaar?sslmode=disable")
	secret := "meinGeheimerSecretKey"

	if err != nil {
		log.Fatal("Fehler beim Verbinden mit der Datenbank:", err)
	}

	if err := db.Ping(); err != nil {
		log.Fatal("Datenbank ist nicht erreichbar:", err)
	}

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"}, // nur deine React-App
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))
	userRepo := repository.NewUserRepository(db)
	userService := services.NewUserService(userRepo)
	userController := handlers.NewUserController(userService)

	bookRepo := repository.NewBookRepository(db)
	bookService := services.NewBookService(bookRepo, userRepo)
	bookController := handlers.NewBookController(bookService)

	authController := handlers.NewAuthController(userService, secret)
	authAdminOnly := middleware.AdminOnly()
	authMiddleware := middleware.AuthMiddleware(secret)

	api := r.Group("/api")
	{
		// Homepage
		api.GET("/books", authMiddleware, bookController.GetBooks)
		api.POST("/books", authMiddleware, authAdminOnly, bookController.AddBooks)
		api.DELETE("/books/:id", authMiddleware, authAdminOnly, bookController.DeleteBooks)

		//Borrow
		api.GET("/books/borrowedBooks", authMiddleware, bookController.GetBorrowedBooks)
		api.POST("/books/:id/borrowBook", authMiddleware, bookController.BorrowBook)
		api.PUT("/books/:id/giveBookBack", authMiddleware, bookController.GiveBorrowedBookBack)

		//Buy
		api.POST("/books/:id/buyBook", authMiddleware, bookController.BuyBook)
		api.POST("/books/buyBooks", authMiddleware, bookController.BuyBooks)
		api.GET("/books/ordered", authMiddleware, bookController.GetOrderedBooks)

		//Users
		api.GET("/users", authMiddleware, authAdminOnly, userController.GetUsers)
		api.GET("/user/me", authMiddleware, userController.GetUserByUserId)
		api.POST("/addUser", userController.AddUser)

		//Login
		api.POST("/login", authController.Login)
		api.POST("/refresh", authController.Refresh)
		api.POST("/logout", authController.Logout)

		//Cart
		api.GET("/books/cart", authMiddleware, bookController.GetCartBooks)
		api.POST("/books/cart/:id", authMiddleware, bookController.AddToCart)
		api.DELETE("/books/cart/:id", authMiddleware, authAdminOnly, bookController.RemoveFromCart)

		//Favorites
		api.GET("/books/Favorites", authMiddleware, bookController.GetFavoriteBooks)
		api.POST("/books/addToFavorites/:id", authMiddleware, bookController.AddToFavorites)
		api.DELETE("/books/deleteFavorite/:id", authMiddleware, bookController.DeleteFavorite)
	}

	if err := r.Run(); err != nil {
		log.Fatal("Fehler beim Starten des Servers:", err)
	}
}
