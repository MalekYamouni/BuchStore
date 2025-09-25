package handlers

import (
	"bookbazaar-backend/internal/models"
	"bookbazaar-backend/internal/services"
	"log"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

type BookController struct {
	Service services.BookService
}

func NewBookController(s services.BookService) *BookController {
	return &BookController{Service: s}
}

func (c *BookController) GetBooks(ctx *gin.Context) {
	books, err := c.Service.GetAll()

	if err != nil {
		ctx.JSON(500, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(200, books)
}

func (c *BookController) AddBooks(ctx *gin.Context) {
	var book models.Book
	if err := ctx.BindJSON(&book); err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	createdBook, err := c.Service.Create(&book)
	if err != nil {
		log.Println("Error aus Service:", err.Error())
		if strings.Contains(err.Error(), "existiert bereits") {
			ctx.JSON(409, gin.H{"message": err.Error()})
			return
		}
		ctx.JSON(500, gin.H{"message": err.Error()})
		return
	}
	ctx.JSON(200, createdBook)
}

func (c *BookController) DeleteBooks(ctx *gin.Context) {
	idParam := ctx.Param("id")

	id, err := strconv.Atoi(idParam)

	if err != nil {
		ctx.JSON(400, gin.H{"error": "Ungültige ID"})
		return
	}
	log.Println("Controller.Delete wurde aufgerufen")
	err = c.Service.Delete(id)

	if err != nil {
		ctx.JSON(404, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(200, gin.H{"message": "Buch erfolgreich gelöscht"})
}

func (c *BookController) BuyBook(ctx *gin.Context) {
	bookId, _ := strconv.Atoi(ctx.Param("id"))
	log.Println(bookId)

	// userID wird in der Middleware gesetzt
	userID, exists := ctx.Get("userId")

	if !exists {
		ctx.JSON(401, gin.H{"error": "UserID nicht gefunden"})
		return
	}

	err := c.Service.BuyBook(userID.(int), bookId)
	if err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(200, gin.H{"message": "Buch erfolgreich gekauft"})
}

func (c *BookController) BuyBooks(ctx *gin.Context) {

	userIDRaw, exists := ctx.Get("userId")
	if !exists {
		ctx.JSON(400, gin.H{"error": "UserId nicht gefunden"})
		return
	}

	userID := userIDRaw.(int)

	var body struct {
		Purchases []struct {
			BookId   int `json:"bookId"`
			Quantity int `json:"quantity"`
		} `json:"purchases"`
	}

	if err := ctx.ShouldBindJSON(&body); err != nil {
		ctx.JSON(400, gin.H{"error": "Ungültige Daten"})
		return
	}

	if len(body.Purchases) == 0 {
		ctx.JSON(400, gin.H{"error": "Keine Buch-IDs übergeben"})
		return
	}

	purchases := make([]services.Purchase, len(body.Purchases))

	for i, p := range body.Purchases {
		purchases[i] = services.Purchase{
			BookId:   p.BookId,
			Quantity: p.Quantity,
		}
	}

	err := c.Service.BuyBooks(userID, purchases)

	if err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(200, gin.H{"message": "Bücher erfolgreich gekauft"})
}

func (c *BookController) BorrowBook(ctx *gin.Context) {
	var req struct {
		Days int `json:"days"`
	}
	if err := ctx.BindJSON(&req); err != nil || req.Days <= 0 {
		ctx.JSON(400, gin.H{"error": "Ungültiger Body: days fehlt oder ist <= 0"})
		return
	}

	userAny, exists := ctx.Get("user")
	if !exists {
		ctx.JSON(401, gin.H{"error": "Nicht eingeloggt"})
		return
	}
	user := userAny.(models.User)

	bookIdStr := ctx.Param("id")
	bookId, err := strconv.Atoi(bookIdStr)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "Ungültige Buch-ID"})
		return
	}

	err = c.Service.BorrowBook(user.ID, bookId, req.Days)
	if err != nil {
		ctx.JSON(500, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(200, gin.H{"success": true})
}

func (c *BookController) GetBorrowedBooks(ctx *gin.Context) {
	userAny, exists := ctx.Get("user")
	if !exists {
		ctx.JSON(401, gin.H{"error": "Nicht eingeloggt"})
		return
	}
	user := userAny.(models.User)
	books, err := c.Service.GetBorrowedBooks(user.ID)
	if err != nil {
		ctx.JSON(500, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(200, books)
}

func (c *BookController) GiveBorrowedBookBack(ctx *gin.Context) {
	bookIdStr := ctx.Param("id")
	bookId, err := strconv.Atoi(bookIdStr)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "Ungültige Buch-ID"})
		return
	}

	userAny, exists := ctx.Get("user")
	if !exists {
		ctx.JSON(401, gin.H{"error": "Nicht eingeloggt"})
		return
	}
	user := userAny.(models.User)

	err = c.Service.GiveBorrowedBookBack(user.ID, bookId)
	if err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(200, gin.H{"message": "Buch erfolgreich zurückgegeben"})
}

func (c *BookController) SetUser(ctx *gin.Context) {
	userIdFloat, err := strconv.ParseFloat(ctx.Param("userId"), 64)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "Ungültige UserID"})
		return
	}

	role := ctx.Param("role")

	ctx.Set("user", models.User{ID: int(userIdFloat), Role: role})

	ctx.JSON(200, gin.H{"message": "User gesetzt"})
}
