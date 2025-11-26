package handlers

import (
	"bookbazaar-backend/internal/services"
	"crypto/rand"
	"encoding/base64"
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

type TokenResponse struct {
	AcccessToken string `json:"access_token"`
	UserId       int    `json:"userId"`
	Role         string `json:"role"`
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func (a *AuthController) createAccessToken(userId int, role string) (string, error) {
	claims := jwt.MapClaims{
		"userId": userId,
		"role":   role, // Muss "admin" sein, wenn der User Admin ist!
		"exp":    time.Now().Add(10 * time.Minute).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(a.Secret))
}

func generateRandomToken(length int) (string, error) {
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(bytes), nil
}

func (a *AuthController) Login(ctx *gin.Context) {
	var req LoginRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(400, gin.H{"error": "Ungültige Daten"})
		return
	}

	// user, err := a.Service.ValidateUser(req.Username, req.Password)
	// if err != nil {
	// 	ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Benutzername oder Passwort falsch"})
	// 	return
	// }

	user, err := a.Service.ValidateUserCredentials(req.Username, req.Password)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Benutzername oder Passwort falsch"})
		return
	}

	println(user)

	accessToken, err := a.createAccessToken(user.ID, user.Role)
	if err != nil {
		ctx.JSON(500, gin.H{"error": "Fehler beim Erstellen des Access-Tokens"})
		return
	}

	refreshToken, err := generateRandomToken(64)

	if err != nil {
		ctx.JSON(500, gin.H{"error": "Fehler beim Erstellen des Refresh-Tokens"})
		return
	}

	err = a.Service.StoreRefreshToken(user.ID, refreshToken)
	if err != nil {
		ctx.JSON(500, gin.H{"error": "Fehler speichern des Refresh-Tokens"})
		return
	}

	maxAge := 30 * 24 * 60 * 60

	ctx.SetCookie("refresh_token", refreshToken, maxAge, "/", "localhost", false, true)

	ctx.JSON(http.StatusOK, TokenResponse{
		AcccessToken: accessToken,
		UserId:       user.ID,
		Role:         user.Role,
	})
}

func (a *AuthController) Refresh(ctx *gin.Context) {

	var token string
	if cookie, err := ctx.Cookie("refresh_token"); err == nil && cookie != "" {
		token = cookie
	} else {
		var req struct {
			RefreshToken string `json:"refresh_token"`
		}
		if err := ctx.ShouldBindJSON(&req); err != nil || req.RefreshToken == "" {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Refresh token fehlt"})
			return
		}
		token = req.RefreshToken
	}

	userID, err := a.Service.ValidateRefreshToken(token)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Refresh Token ungültig oder abgelaufen"})
		return
	}

	// Rolle ggf. aus DB holen
	user, err := a.Service.GetUserByUserId(userID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "User nicht gefunden"})
		return
	}

	accessToken, err := a.createAccessToken(user.ID, user.Role)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Access Token konnte nicht erstellt werden"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"access_token": accessToken})
}

func (a *AuthController) Logout(ctx *gin.Context) {
	refreshToken, err := ctx.Cookie("refresh_token")
	if err != nil || refreshToken == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Refresh token fehlt"})
		return
	}

	if err := a.Service.RevokeRefreshToken(refreshToken); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Logout fehlgeschlagen"})
		return
	}

	// Cookie löschen
	ctx.SetCookie("refresh_token", "", -1, "/", "localhost", false, true)

	ctx.JSON(http.StatusOK, gin.H{"message": "Erfolgreich ausgeloggt"})
}
