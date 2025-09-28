package middleware

import (
	"bookbazaar-backend/internal/models"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func AuthMiddleware(secret string) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		// Also die Middleware wird beim Login aufgerufen und extrahiert die userId aus dem header
		authHeader := ctx.GetHeader("Authorization")
		if authHeader == "" {
			ctx.AbortWithStatusJSON(401, gin.H{"error": "Authorization Header fehlt"})
			return
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
			return []byte(secret), nil
		})

		if err != nil || !token.Valid {
			ctx.AbortWithStatusJSON(401, gin.H{"error": "Token abgelaufen"})
			return
		}
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			ctx.AbortWithStatusJSON(401, gin.H{"error": "Token ungültig"})
			return
		}

		userIdFloat, ok := claims["userId"].(float64)
		if !ok {
			ctx.AbortWithStatusJSON(401, gin.H{"error": "UserId fehlt"})
			return
		}

		role, ok := claims["role"].(string)
		if !ok {
			role = "user" // Standardrolle
		}

		ctx.Set("user", models.User{ID: int(userIdFloat), Role: role})
		ctx.Next()
	}
}

// AdminOnly prüft, ob der eingeloggte User ein Admin ist
func AdminOnly() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		userInterface, exists := ctx.Get("user") // Auth-Middleware muss user setzen
		if !exists {
			ctx.JSON(401, gin.H{"message": "Nicht eingeloggt"})
			ctx.Abort()
			return
		}

		user := userInterface.(models.User)
		if user.Role != "admin" {
			ctx.JSON(403, gin.H{"message": "Nicht autorisiert"})
			ctx.Abort()
			return
		}
		ctx.Next()
	}
}
