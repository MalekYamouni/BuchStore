package handlers

import (
	"bookbazaar-backend/internal/services"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type AuthController struct {
	Service services.UserService
	Secret  string
}

func NewAuthController(service services.UserService, secret string) *AuthController {
	return &AuthController{Service: service, Secret: secret}
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func (a *AuthController) Login(ctx *gin.Context) {
	var req LoginRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(400, gin.H{"error": "Ungültige Daten"})
		return
	}

	user, err := a.Service.ValidateUser(req.Username, req.Password)

	if err != nil {
		ctx.JSON(401, gin.H{"error": "Benutzername oder Passwort falsch"})
		return
	}

	// Hier wird der validierte User im Speicher des Tokens unter dem Tag "userId" gespeichert
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userId": user.ID,
		"role":   user.Role,
		"exp":    time.Now().Add(1 * time.Hour).Unix(),
	})

	tokenString, err := token.SignedString([]byte(a.Secret))

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Token konnte nicht erstellt werden"})
		return
	}

	ctx.JSON(200, gin.H{"token": tokenString, "userId": user.ID, "role": user.Role})
}
