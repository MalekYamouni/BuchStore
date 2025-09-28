package repository

import (
	"bookbazaar-backend/internal/models"
	"database/sql"
	"fmt"
	"log"
	"time"
)

type BookRepository struct {
	db *sql.DB
}

func NewBookRepository(db *sql.DB) *BookRepository {
	return &BookRepository{db: db}
}

func (r *BookRepository) GetAll() ([]models.Book, error) {
	rows, err := r.db.Query("SELECT id, author, name, price, genre, description, descriptionlong, quantity, borrowprice FROM books")
	if err != nil {
		log.Println("Fehler bei Query:", err)
		return nil, err
	}
	defer rows.Close()
	var books []models.Book
	for rows.Next() {
		var book models.Book
		if err := rows.Scan(&book.ID, &book.Author, &book.Name, &book.Price, &book.Genre, &book.Description, &book.Descriptionlong, &book.Quantity, &book.BorrowPrice); err != nil {
			log.Println("Fehler beim Scan:", err)
			return nil, err
		}
		books = append(books, book)
	}
	return books, nil
}

func (r *BookRepository) GetBorrowedBooks(userId int) ([]models.Book, error) {
	rows, err := r.db.Query("SELECT b.id, b.author, b.name, b.price, b.genre, b.description, b.descriptionlong, b.quantity, b.borrowprice, bb.due_at FROM books b INNER JOIN borrowed_books bb ON bb.book_id = b.id WHERE bb.user_id = $1 AND bb.returned_at IS NULL", userId)

	if err != nil {
		log.Println("Fehler bei der BorrowedBooks-Query")
		return nil, err
	}
	defer rows.Close()

	var borrowedBooks []models.Book
	for rows.Next() {
		var book models.Book
		var dueAt time.Time
		if err := rows.Scan(&book.ID, &book.Author, &book.Name, &book.Price, &book.Genre, &book.Description, &book.Descriptionlong, &book.Quantity, &book.BorrowPrice, &dueAt); err != nil {
			log.Println("Fehler beim Scan der ausgeliehenen Bücher", err)
			return nil, err
		}
		book.DueAt = dueAt.Format("2006-01-02T15:04:05") // lokale Zeit, keine Zeitzone
		borrowedBooks = append(borrowedBooks, book)
	}

	return borrowedBooks, nil
}

func (r *BookRepository) GetBookByName(bookName string) (*models.Book, error) {

	var book models.Book

	query := `SELECT id, author, name, price, genre, description, descriptionlong, quantity FROM books Where name=$1`

	err := r.db.QueryRow(query, bookName).Scan(&book.ID, &book.Author, &book.Name, &book.Price, &book.Genre, &book.Description, &book.Descriptionlong, &book.Quantity)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &book, nil
}

func (r *BookRepository) Add(book *models.Book) error {

	var exists bool
	err := r.db.QueryRow("SELECT EXISTS(SELECT 1 FROM books Where name= $1 AND author=$2)", book.Name, book.Author).Scan(&exists)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("buch '%s' von '%s' existiert bereits", book.Name, book.Author)
	}

	query := `INSERT INTO books (author, name, price, genre, description, descriptionlong, quantity, borrowprice) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`

	err = r.db.QueryRow(query, book.Author, book.Name, book.Price, book.Genre, book.Description, book.Descriptionlong, book.Quantity, book.BorrowPrice).Scan(&book.ID)

	if err != nil {
		log.Println("Fehler beim Insert", err)
		return err
	}
	log.Println("Neues Buch ID:", book.ID)
	return nil
}

func (r *BookRepository) Delete(id int) error {

	query := `DELETE FROM books WHERE id=$1`

	result, err := r.db.Exec(query, id)

	if err != nil {
		log.Println("Fehler beim Delete", err)
		return err
	}

	rowsAffected, err := result.RowsAffected()

	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		log.Println("Kein Buch gefunden mit ID: ", id)
		return fmt.Errorf("kein Buch mit ID %d gefunden", id)
	}

	log.Println("Buch erfolgreich gelöscht mit ID:", id)

	return nil
}

func (r *BookRepository) BuyBook(userID, bookID int) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Guthaben prüfen
	var balance float64
	err = tx.QueryRow("SELECT balance FROM users WHERE id=$1", userID).Scan(&balance)

	if err != nil {
		log.Println("Fehler beim Scannen des Guthabens")
		return err
	}

	// Menge prüfen
	var quantity int
	err = tx.QueryRow("SELECT quantity FROM books WHERE id=$1", bookID).Scan(&quantity)
	if err != nil {
		log.Println("Fehler beim Scannen der Menge")
		return err
	}

	if quantity < 1 {
		return fmt.Errorf("buch ist nicht mehr verfügbar")
	}

	var price float64
	err = tx.QueryRow("SELECT price FROM books WHERE id=$1", bookID).Scan(&price)
	if err != nil {
		log.Println("Fehler beim Setzen des Preises")
		return err
	}

	_, err = tx.Exec("UPDATE users SET balance = balance - $1 WHERE id=$2", price, userID)
	if err != nil {
		log.Println("Fehler beim Update Kauf")
		return err
	}

	_, err = tx.Exec("UPDATE books SET quantity = quantity - 1 Where id=$1", bookID)
	if err != nil {
		log.Println("Fehler beim Update Menge Buch")
	}

	_, err = tx.Exec("INSERT INTO user_books (user_id, book_id) VALUES ($1, $2)", userID, bookID)
	if err != nil {
		log.Println("Fehler beim Insert Kauf")
		return err
	}

	return tx.Commit()
}

type Purchase struct {
	BookId   int `json:"bookId"`
	Quantity int `json:"quantity"`
}

func (r *BookRepository) BuyBooks(userID int, purchases []Purchase) error {
	tx, err := r.db.Begin()

	if err != nil {
		return err
	}

	defer tx.Rollback()

	// Guthaben prüfen
	var balance float64
	err = tx.QueryRow("SELECT balance FROM users WHERE id=$1", userID).Scan(&balance)

	if err != nil {
		log.Println("Fehler beim Scannen des Guthabens")
		return err
	}

	var totalprice float64

	for _, p := range purchases {
		var price float64
		var stock int
		err = tx.QueryRow("Select price, quantity FROM books Where id=$1", p.BookId).Scan(&price, &stock)

		if err != nil {
			if err == sql.ErrNoRows {
				return fmt.Errorf("buch mit ID %d existiert nicht", p.BookId)
			}
			log.Println("Fehler beim Preis und Bestand abfragen:", err)
			return err
		}
		if stock < p.Quantity {
			return fmt.Errorf("nicht genug Bestand für BuchID %d", p.BookId)
		}
		totalprice += price * float64(p.Quantity)
	}

	if balance < totalprice {
		return fmt.Errorf("nicht genügend Guthaben: %.2f benötigt, %.2f verfügbar", totalprice, balance)
	}

	_, err = tx.Exec("UPDATE users SET balance = balance - $1 WHERE id=$2", totalprice, userID)
	if err != nil {
		log.Println("Fehler beim Guthaben-Update")
		return err
	}

	for _, p := range purchases {
		_, err = tx.Exec("Update books Set quantity = quantity- $1 Where id=$2", p.Quantity, p.BookId)
		if err != nil {
			return err
		}

		_, err = tx.Exec("INSERT INTO user_books (user_id, book_id, quantity) VALUES ($1,$2,$3) ON CONFLICT(user_id, book_id) DO UPDATE SET quantity = user_books.quantity + EXCLUDED.quantity", userID, p.BookId, p.Quantity)
		if err != nil {
			log.Println("Fehler beim Insert in user_books")
			return err
		}
	}
	return tx.Commit()
}

func (r *BookRepository) BorrowBook(userId, bookId, days int) error {
	tx, err := r.db.Begin()
	if err != nil {
		return fmt.Errorf("datenbank nicht erreichbar")
	}

	defer tx.Rollback()

	// Guthaben prüfen
	var balance float64

	err = tx.QueryRow("SELECT balance FROM users WHERE id=$1", userId).Scan(&balance)

	if err != nil {
		return err
	}

	// Menge prüfen
	var quantity int
	err = tx.QueryRow("SELECT quantity FROM books WHERE id=$1", bookId).Scan(&quantity)
	if err != nil {
		log.Println("Fehler beim Scannen der Menge")
		return err
	}

	if quantity < 1 {
		return fmt.Errorf("buch ist nicht mehr verfügbar")
	}

	var borrowprice float64

	err = tx.QueryRow("SELECT borrowprice FROM books WHERE id=$1", bookId).Scan(&borrowprice)

	if err != nil {
		log.Println("Fehler bei borrowPrice query")
		return err
	}

	//Preis vom Guthaben abziehen
	_, err = tx.Exec("UPDATE users Set balance = balance - $1 Where id=$2", borrowprice, userId)
	if err != nil {
		log.Println("Fehler beim Update Userbalance")
		return err
	}

	_, err = tx.Exec("Update books Set quantity = quantity - $1 Where id=$2", 1, bookId)
	if err != nil {
		log.Println("Fehler beim Update quantity - 1")
		return err
	}

	loc, _ := time.LoadLocation("Europe/Berlin")
	dueAt := time.Now().In(loc).Add(10 * time.Minute)

	// Relationstabelle Eintrag
	_, err = tx.Exec("INSERT INTO borrowed_books (user_id, book_id, borrowed_at, due_at) VALUES ($1, $2, Now(), $3)", userId, bookId, dueAt)
	if err != nil {
		log.Println("Fehler beim Insert in borrowed_books")
		return err
	}

	return tx.Commit()
}

func (r *BookRepository) GiveBorrowedBookBack(userId, bookId int) error {
	tx, err := r.db.Begin()

	if err != nil {
		fmt.Errorf("datenbank nicht erreichbar")
		return err
	}

	defer tx.Rollback()

	_, err = tx.Exec("UPDATE borrowed_books Set returned_at= NOW() WHERE book_id = $1 AND user_id = $2", bookId, userId)
	if err != nil {
		log.Println("Fehler beim update returned_at")
		return err
	}

	_, err = tx.Exec("Update books Set quantity = quantity + $1 Where id=$2", 1, bookId)
	if err != nil {
		log.Println("Fehler beim update book quantity + 1")
		return err
	}

	return tx.Commit()
}

func (r *BookRepository) AddToCart(userId, bookId int) error {
	tx, err := r.db.Begin()
	if err != nil {
		return fmt.Errorf("datenbank nicht erreichbar")
	}

	defer tx.Rollback()

	_, err = tx.Exec("INSERT INTO user_cart (user_id, cart_book_id, reservation_expires_at) VALUES ($1, $2, Now() + INTERVAL '5 minutes') ON CONFLICT (user_id, cart_book_id) DO UPDATE SET reservation_expires_at = EXCLUDED.reservation_expires_at, removed_at = NULL", userId, bookId)
	if err != nil {
		log.Println("Fehler beim Insert in user_cart")
		return err
	}

	return tx.Commit()
}

func (r *BookRepository) GetCartBooks(userId int) ([]models.Book, error) {
	tx, err := r.db.Begin()
	if err != nil {
		return nil, fmt.Errorf("datenbank nicht erreichbar")
	}
	defer tx.Rollback()

	query := `
      SELECT b.id, b.author, b.name, b.price, b.genre, b.description, b.descriptionlong,
             b.quantity, b.borrowprice, uc.id AS cart_id, uc.reservation_expires_at
      FROM books b
      INNER JOIN user_cart uc ON b.id = uc.cart_book_id
      WHERE uc.user_id = $1
        AND (uc.reservation_expires_at IS NULL OR uc.reservation_expires_at > NOW())
		AND uc.removed_at IS NULL
	`

	rows, err := tx.Query(query, userId)
	if err != nil {
		log.Println("Fehler bei der Cart-Query", err)
		return nil, err
	}
	defer rows.Close()

	var books []models.Book

	for rows.Next() {
		var book models.Book
		var cartID sql.NullInt64
		var reservation sql.NullTime

		if err := rows.Scan(
			&book.ID,
			&book.Author,
			&book.Name,
			&book.Price,
			&book.Genre,
			&book.Description,
			&book.Descriptionlong,
			&book.Quantity,
			&book.BorrowPrice,
			&cartID,
			&reservation,
		); err != nil {
			log.Println("Fehler beim Scan der Cart-Zeile:", err)
			return nil, err
		}

		if reservation.Valid {
			// sende als RFC3339 mit Offset (empfohlen), oder verwende Format("2006-01-02T15:04:05") wenn du keine TZ willst
			book.ReservationExpiresAt = reservation.Time.Format(time.RFC3339)
		}

		books = append(books, book)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return books, nil
}

func (r *BookRepository) RemoveFromCart(userId, bookId int) error {
	tx, err := r.db.Begin()
	if err != nil {
		log.Println("datenbank nicht erreichbar")
		return err
	}

	defer tx.Rollback()

	query := "Update user_cart SET removed_at = NOW() Where user_id=$1 AND cart_book_id=2$"

	if _, err := tx.Exec(query, userId, bookId); err != nil {
		log.Println("Repository Fehler bei RemoveFromCart")
		return err
	}

	return nil
}
