package services

import (
	"bookbazaar-backend/internal/models"
	"bookbazaar-backend/internal/repository"
	"errors"
	"fmt"
	"log"

	"github.com/go-playground/validator/v10"
)

type Purchase struct {
	BookId   int `json:"bookId"`
	Quantity int `json:"quantity"`
}

type BookService interface {
	GetAll() ([]models.Book, error)
	Create(book *models.Book) (*models.Book, error)
	Delete(id int) error
	BuyBook(userId, bookId int) error
	BuyBooks(userId int, purchases []Purchase) error
	BorrowBook(userId, bookId, days int) error
	GetBorrowedBooks(userId int) ([]models.Book, error)
	GiveBorrowedBookBack(userId, bookId int) error
	GetCartBooks(userId int) ([]models.Book, error)
	AddToCart(userId, bookId int) error
	RemoveFromCart(userId, bookId int) error
	AddToFavorites(userId, bookId int) error
	GetFavoriteBooks(userId int) ([]models.Book, error)
	DeleteFavorite(userId, bookId int) error
}

type DefaultBookService struct {
	repo     *repository.BookRepository
	userRepo *repository.UserRepository
}

func NewBookService(r *repository.BookRepository, ur *repository.UserRepository) BookService {
	return &DefaultBookService{repo: r, userRepo: ur}
}

func (s *DefaultBookService) GetAll() ([]models.Book, error) {
	return s.repo.GetAll()
}

func validateBook(Book *models.Book) error {
	var validate = validator.New()
	return validate.Struct(Book)
}

// Buch hinzufügen
func (s *DefaultBookService) Create(book *models.Book) (*models.Book, error) {
	// Prüfe explizite Business Logic Validierungen zuerst
	if len(book.Name) < 3 {
		return nil, errors.New("buchname muss mindestens 3 Zeichen enthalten")
	}

	if len(book.Author) < 3 {
		return nil, errors.New("autorenname muss mindestens 3 Zeichen enthalten")
	}

	// Dann struct-validation (falls weitere Tags hinzugefügt werden)
	if err := validateBook(book); err != nil {
		return nil, err
	}

	existingBook, err := s.repo.GetBookByName(book.Name)

	if err != nil {
		return nil, err
	}

	if existingBook != nil {
		return nil, fmt.Errorf("Buch '%s' von '%s' existiert bereits", book.Name, book.Author)
	}

	if err := s.repo.Add(book); err != nil {
		return nil, err
	}
	return book, nil
}

// Buch löschen
func (s *DefaultBookService) Delete(id int) error {
	return s.repo.Delete(id)
}

func (s *DefaultBookService) BuyBook(userId, bookId int) error {
	user, err := s.userRepo.GetUserByUserId(userId)

	if err != nil {
		return err
	}

	if user.Balance <= 0 {
		fmt.Errorf("user hat zu wenig Geld um ein Buch zu kaufen")
		return err
	}

	err = s.repo.BuyBook(userId, bookId)
	if err != nil {
		log.Println("service Fehler beim Kauf eines Buches", err)
		return fmt.Errorf("fehler beim Kauf: %w", err)
	}
	return nil
}

func (s *DefaultBookService) BuyBooks(userID int, purchases []Purchase) error {
	user, err := s.userRepo.GetUserByUserId(userID)

	if err != nil {
		return err
	}

	if user.Balance <= 0 {
		log.Println("user hat zu wenig Geld um alle Bücher aus dem Warenkorb zu kaufen")
		return err
	}
	repoPurchases := make([]repository.Purchase, len(purchases))
	for i, p := range purchases {
		repoPurchases[i] = repository.Purchase{
			BookId:   p.BookId,
			Quantity: p.Quantity,
		}
	}

	err = s.repo.BuyBooks(userID, repoPurchases)
	if err != nil {
		log.Println("service Fehler beim Kauf aller Bücher")
		return fmt.Errorf("fehler beim Kauf: %w", err)
	}
	return nil
}

func (s *DefaultBookService) BorrowBook(userId, bookId, days int) error {
	user, err := s.userRepo.GetUserByUserId(userId)

	if err != nil {
		return err
	}

	if user.Balance <= 0 {
		log.Println("User hat zu wenig Geld um sich ein Buch auszuleihen")
		return err
	}

	err = s.repo.BorrowBook(userId, bookId, days)
	if err != nil {
		log.Println("service Fehler beim leihen eines Buches")
		return err
	}
	return nil
}

func (s *DefaultBookService) GetBorrowedBooks(userId int) ([]models.Book, error) {

	books, err := s.repo.GetBorrowedBooks(userId)
	if err != nil {
		log.Println("service Fehler beim getten der geliehenen Bücher", err)
		return nil, err
	}

	return books, nil
}

func (s *DefaultBookService) GiveBorrowedBookBack(userId, bookId int) error {
	err := s.repo.GiveBorrowedBookBack(userId, bookId)
	if err != nil {
		log.Print("service Fehler beim Buch zurückgeben", err)
		return err
	}
	return nil
}

func (s *DefaultBookService) GetCartBooks(userId int) ([]models.Book, error) {
	books, err := s.repo.GetCartBooks(userId)
	if err != nil {
		log.Println("service Fehler beim getten der Bücher im Warenkorb", err)
		return nil, err
	}
	return books, nil
}

func (s *DefaultBookService) AddToCart(userId, bookId int) error {
	err := s.repo.AddToCart(userId, bookId)
	if err != nil {
		log.Println("service Fehler beim hinzufügen der Bücher im Warenkorb", err)
		return err
	}

	return nil
}

func (s *DefaultBookService) RemoveFromCart(userId, bookId int) error {
	err := s.repo.RemoveFromCart(userId, bookId)
	if err != nil {
		log.Println("service Fehler beim entfernen der Bücher aus dem Warenkorb", err)
		return err
	}
	return nil
}
func (s *DefaultBookService) AddToFavorites(userId, bookId int) error {
	err := s.repo.AddToFavorites(userId, bookId)
	if err != nil {
		log.Println("service Fehler beim hinzufügen eines Buches in die Favoriten")
		return err
	}
	return nil
}

func (s *DefaultBookService) GetFavoriteBooks(userId int) ([]models.Book, error) {
	return s.repo.GetFavoriteBooks(userId)
}

func (s *DefaultBookService) DeleteFavorite(userId, bookId int) error {
	err := s.repo.DeleteFavorite(userId, bookId)
	if err != nil {
		log.Println("service Fehler beim Löschen eines Favoriten")
		return err
	}
	return nil
}
