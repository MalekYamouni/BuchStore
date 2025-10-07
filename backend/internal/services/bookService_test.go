package services

import (
	"bookbazaar-backend/internal/models"
	"testing"

	"github.com/stretchr/testify/assert"
)

// TestValidateBook testet die validateBook Funktion
// Diese Funktion prüft die Struktur-Validierung eines Buches
func TestValidateBook(t *testing.T) {
	// Test 1: Gültiges Buch sollte keine Fehler haben
	t.Run("Gültiges Buch", func(t *testing.T) {
		// Arrange (Vorbereitung)
		validBook := &models.Book{
			Name:        "Der Herr der Ringe",
			Author:      "J.R.R. Tolkien",
			Genre:       "Fantasy",
			Price:       15.99,
			Description: "Ein episches Fantasy-Abenteuer",
		}

		// Act (Ausführung)
		err := validateBook(validBook)

		// Assert (Überprüfung)
		assert.NoError(t, err, "Ein gültiges Buch sollte keine Validierungsfehler haben")
	})

	// Test 2: Buch ohne Name sollte Fehler haben
	t.Run("Buch ohne Namen", func(t *testing.T) {

		book := &models.Book{
			Name:        "",
			Author:      "J.R.R. Tolkien",
			Genre:       "Horror",
			Price:       2.99,
			Description: "Episches Ding",
		}

		err := validateBook(book)

		assert.Error(t, err, "Ein ungültiges Buch ohne Namen")
		assert.Contains(t, err.Error(), "Name", "Fehlermeldung sollte 'Name' enthalten")

	})

	// Test 3: Buch ohne Autor sollte Fehler haben
	t.Run("Buch ohne Autor", func(t *testing.T) {
		book := &models.Book{
			Name:        "Test",
			Author:      "",
			Genre:       "Test",
			Price:       2.99,
			Description: "Test",
		}

		err := validateBook(book)

		assert.Error(t, err, "Ein ungültiges Buch ohne Autor")
	})

	// Test 4: Buch mit negativem Preis sollte Fehler haben
	t.Run("Buch mit negativem Preis", func(t *testing.T) {
		book := &models.Book{
			Name:        "Test",
			Author:      "Test",
			Genre:       "Test",
			Price:       -5.99,
			Description: "Test",
		}

		err := validateBook(book)

		assert.Error(t, err, "Buch mit negativem Preis ist ungültig")
	})

}

// TestCreateBookValidations testet die Business Logic der Create-Methode
// Diese Tests prüfen die Validierungsregeln ohne Datenbankzugriffe
func TestCreateBookValidations(t *testing.T) {
	// Hier erstellen wir einen Mock für die Repositories
	// Da wir nur die Validierungslogik testen wollen, verwenden wir nil
	// In echten Tests würdest du Mocks verwenden
	service := &DefaultBookService{
		repo:     nil, // Wir testen nur Validierungslogik
		userRepo: nil,
	}

	// Test 1: Buchname zu kurz (weniger als 3 Zeichen)
	t.Run("Buchname zu kurz", func(t *testing.T) {
		// Arrange
		shortNameBook := &models.Book{
			Name:        "AB", // Nur 2 Zeichen
			Author:      "J.R.R. Tolkien",
			Genre:       "Fantasy",
			Price:       15.99,
			Description: "Test Beschreibung",
		}

		// Act
		result, err := service.Create(shortNameBook)

		// Assert
		assert.Error(t, err, "Ein Buch mit zu kurzem Namen sollte einen Fehler zurückgeben")
		assert.Nil(t, result, "Bei einem Fehler sollte das Resultat nil sein")
		assert.Contains(t, err.Error(), "mindestens 3 Zeichen", "Fehlermeldung sollte '3 Zeichen' enthalten")
	})

	// Test 2: Autorenname zu kurz (weniger als 3 Zeichen)
	t.Run("Autorenname zu kurz", func(t *testing.T) {
		// Arrange
		shortAuthorBook := &models.Book{
			Name:        "Der Herr der Ringe",
			Author:      "JR", // Nur 2 Zeichen
			Genre:       "Fantasy",
			Price:       15.99,
			Description: "Test Beschreibung",
		}

		// Act
		result, err := service.Create(shortAuthorBook)

		// Assert
		assert.Error(t, err, "Ein Buch mit zu kurzem Autorennamen sollte einen Fehler zurückgeben")
		assert.Nil(t, result, "Bei einem Fehler sollte das Resultat nil sein")
		assert.Contains(t, err.Error(), "autorenname muss mindestens 3 Zeichen", "Fehlermeldung sollte korrekt sein")
	})

}
