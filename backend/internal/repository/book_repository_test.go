package repository

import (
	"database/sql" // Standardbibliothek: generische DB Schnittstelle
	"regexp"       // Wird genutzt um den SQL String zu escapen (QuoteMeta)
	"testing"      // Go's Testing-Paket

	"github.com/DATA-DOG/go-sqlmock"      // Mocking-Library für database/sql
	"github.com/stretchr/testify/assert"  // Komfortable Assertions (nicht fatal)
	"github.com/stretchr/testify/require" // Assertions, die den Test sofort abbrechen (fatal) bei Fehler
)

// setupMockDB richtet eine sqlmock Instanz ein und gibt zusätzlich direkt
// ein BookRepository zurück, das diese *sql.DB benutzt.
// Rückgabewerte:
//   - *sql.DB: die gemockte DB Connection (muss am Ende geschlossen werden)
//   - sqlmock.Sqlmock: Objekt, mit dem wir Erwartungen (Expect...) definieren
//   - *BookRepository: das Repository unter Test, dem wir die gemockte DB injizieren
func setupMockDB(t *testing.T) (*sql.DB, sqlmock.Sqlmock, *BookRepository) {
	db, mock, err := sqlmock.New()         // Erzeugt In-Memory / Fake DB + Mock Controller
	require.NoError(t, err)                // Bricht Test ab, falls DB nicht erstellt werden konnte
	return db, mock, NewBookRepository(db) // BookRepository verwendet dieselbe *sql.DB
}

// TestBookRepository_GetAll prüft den Happy Path der GetAll()-Methode:
// 1. Die erwartete SELECT Query wird abgesetzt.
// 2. Die Reihenfolge und Anzahl der gescannten Spalten stimmt.
// 3. Die zurückgegebenen Slice-Werte haben die erwarteten Inhalte.
// 4. Alle gesetzten Erwartungen (ExpectQuery) wurden erfüllt.
func TestBookRepository_GetAll(t *testing.T) {
	// Test-Setup: gemockte DB + Mock Controller + Repository
	db, mock, repo := setupMockDB(t)
	defer db.Close() // Wichtig: Verbindung schließen, damit sqlmock alle Erwartungen sauber validieren kann

	// Query-String exakt so wie in der echten Implementierung.
	// regexp.QuoteMeta sorgt dafür, dass Sonderzeichen escaped werden
	// (gibt uns Stabilität, falls wir z.B. Leerzeichen oder Klammern haben).
	query := regexp.QuoteMeta(`SELECT id, author, name, price, genre, description, descriptionlong, quantity, borrowprice FROM books`)

	// Wir definieren hier die simulierten Result-Set Zeilen in EXACT der Reihenfolge,
	// in der GetAll() später rows.Scan(...) aufruft.
	rows := sqlmock.NewRows([]string{
		"id", "author", "name", "price", "genre", "description", "descriptionlong", "quantity", "borrowprice",
	}).
		// Erste Buch-Zeile
		AddRow(1, "Autor A", "Buch A", 9.99, "Roman", "Kurz", "Lang", 5, 1.99).
		// Zweite Buch-Zeile
		AddRow(2, "Autor B", "Buch B", 19.49, "SciFi", "Kurz2", "Lang2", 2, 2.49)

	// Erwartung: Genau diese Query wird ausgeführt und liefert obige Rows zurück
	mock.ExpectQuery(query).WillReturnRows(rows)

	// ACT: Methode unter Test aufrufen
	books, err := repo.GetAll()

	// VALIDIERUNG: Kein Fehler beim Ausführen
	require.NoError(t, err)
	// Genau 2 Einträge im Slice
	require.Len(t, books, 2)

	// Feldinhalte der ersten Zeile prüfen
	assert.Equal(t, 1, books[0].ID)
	assert.Equal(t, "Autor A", books[0].Author)
	assert.Equal(t, 5, books[0].Quantity)
	// Zweite Zeile
	assert.Equal(t, 2, books[1].ID)
	assert.Equal(t, "Buch B", books[1].Name)

	// Stellt sicher, dass ALLE definierten Erwartungen (ExpectQuery etc.) wirklich aufgerufen wurden.
	require.NoError(t, mock.ExpectationsWereMet())
}
