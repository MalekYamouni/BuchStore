package handlers

import (
	"bookbazaar-backend/internal/models"
	"bookbazaar-backend/internal/services"
	"log"

	"github.com/gin-gonic/gin"
)

type BuyedBookRequest struct {
}

type UserController struct {
	Service services.UserService
}

func NewUserController(s services.UserService) *UserController {
	return &UserController{Service: s}
}

func (c *UserController) GetUsers(ctx *gin.Context) {
	log.Println("Controller.GetUsers wurde aufgerufen")
	users, err := c.Service.GetAllUsers()
	if err != nil {
		ctx.JSON(500, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(200, users)
}

func (c *UserController) AddUser(ctx *gin.Context) {
	log.Println("Controller.AddUser wurde aufgerufen")

	var user models.User
	if err := ctx.BindJSON(&user); err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		log.Println("Controller error")
		return
	}

	createdUser, err := c.Service.AddUser(&user)

	if err != nil {
		ctx.JSON(500, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(200, createdUser)
}

func (c *UserController) GetUserByUserId(ctx *gin.Context) {
	userAny, exists := ctx.Get("user")
	if !exists {
		ctx.JSON(401, gin.H{"error": "Nicht eingeloggt"})
		return
	}

	userID := userAny.(models.User).ID

	user, err := c.Service.GetUserByUserId(userID)

	if err != nil {
		ctx.JSON(400, "Ungültiger User")
		return
	}
	ctx.JSON(200, user)
}
