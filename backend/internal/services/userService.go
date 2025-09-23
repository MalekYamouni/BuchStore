package services

import (
	"bookbazaar-backend/internal/models"
	"bookbazaar-backend/internal/repository"
	"errors"
	"log"
	"net/mail"

	"github.com/go-playground/validator/v10"
)

type UserService interface {
	GetAllUsers() ([]models.User, error)
	AddUser(user *models.User) (*models.User, error)
	ValidateUser(username, password string) (*models.User, error)
	GetUserByUserId(userId int) (*models.User, error)
}

type DefaultUserService struct {
	repo *repository.UserRepository
}

func NewUserService(r *repository.UserRepository) UserService {
	return &DefaultUserService{repo: r}
}

func (s *DefaultUserService) GetAllUsers() ([]models.User, error) {
	log.Println("Service.GetAllUsers wurde aufgerufen")
	return s.repo.GetAllUsers()
}

func isValidEmail(email string) bool {
	_, err := mail.ParseAddress(email)
	return err == nil
}

func validateUser(User *models.User) error {
	var validate = validator.New()
	return validate.Struct(User)
}

func (s *DefaultUserService) AddUser(user *models.User) (*models.User, error) {
	log.Println("Service.AddUser wurde aufgerufen")

	if err := validateUser(user); err != nil {
		return nil, err
	}

	if !isValidEmail(user.Email) {
		return nil, errors.New("email ist nicht gültig")
	}

	if user.Role == "" {
		user.Role = "user"
	}
	if len(user.Name) < 3 || len(user.Lastname) < 3 {
		return nil, errors.New("vor- Nachname müssen mindestens 3 Zeichen haben")
	}

	if len(user.Password) < 6 {
		return nil, errors.New("passwort muss mindestens 6 Zeichen haben")
	}

	existingUser, err := s.repo.GetUserByUserId(user.ID)

	if err != nil {
		return nil, err
	}

	if existingUser != nil {
		return nil, errors.New("username existiert bereits")
	}

	if err := s.repo.AddUser(user); err != nil {
		return nil, err
	}

	log.Println(user)
	return user, nil
}

func (s *DefaultUserService) ValidateUser(username, password string) (*models.User, error) {
	user, err := s.repo.GetUserByUserName(username)
	if err != nil || user.Password != password {
		return nil, errors.New("ungültiger Benutzer oder Passwort")
	}
	return user, nil
}

func (s *DefaultUserService) GetUserByUserId(userId int) (*models.User, error) {
	user, err := s.repo.GetUserByUserId(userId)

	if err != nil {
		return nil, errors.New("ungüliter Benutzer")
	}

	return user, nil
}
