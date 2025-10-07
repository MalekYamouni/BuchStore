package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestAdminOnly(t *testing.T) {
	gin.SetMode(gin.TestMode)

	t.Run("kein user gesetzt → 401", func(t *testing.T) {
		// Arrange
		router := gin.New()
		router.Use(AdminOnly()) // Middleware aktivieren
		router.GET("/admin", func(ctx *gin.Context) {
			ctx.JSON(200, gin.H{"message": "OK"})
		})

		req, _ := http.NewRequest(http.MethodGet, "/admin", nil)
		resp := httptest.NewRecorder()

		// Act
		router.ServeHTTP(resp, req)

		// Assert
		assert.Equal(t, 401, resp.Code)
		assert.Contains(t, resp.Body.String(), "Nicht eingeloggt")
	})

}
