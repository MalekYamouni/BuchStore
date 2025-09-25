package repository

import (
	"bookbazaar-backend/internal/models"
	"database/sql"
	"log"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) GetAllUsers() ([]models.User, error) {
	log.Println("Repository.GetAllUsers wurde aufgerufen")
	rows, err := r.db.Query("SELECT id, name, lastname, username, email, created, password FROM users")

	if err != nil {
		log.Println("Fehler bei UserQuery", err)
		return nil, err
	}
	defer rows.Close()

	var users []models.User

	for rows.Next() {
		var user models.User
		if err := rows.Scan(&user.ID, &user.Name, &user.Lastname, &user.Username, &user.Email, &user.Created, &user.Password); err != nil {
			log.Println("Fehler beim Scan", err)
			return nil, err
		}
		users = append(users, user)
	}
	return users, nil
}

func (r *UserRepository) GetUserByUserName(username string) (*models.User, error) {

	var user models.User

	query := `SELECT id, name, lastname, username, email, created, password, role FROM users WHERE username=$1`

	err := r.db.QueryRow(query, username).Scan(
		&user.ID,
		&user.Name,
		&user.Lastname,
		&user.Username,
		&user.Email,
		&user.Created,
		&user.Password,
		&user.Role,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &user, err
}

func (r *UserRepository) GetUserByUserId(userId int) (*models.User, error) {
	var user models.User

	query := `SELECT id, name, lastname, username, email, created, password, balance, role FROM users Where id=$1`

	err := r.db.QueryRow(query, userId).Scan(&user.ID, &user.Name, &user.Lastname, &user.Username, &user.Email, &user.Created, &user.Password, &user.Balance, &user.Role)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) AddUser(user *models.User) error {
	log.Println("Repository.AddUser wurde aufgerufen")

	query := `INSERT INTO users ( name, lastname, username, email, password) VALUES($1, $2, $3, $4, $5) RETURNING created, id`

	err := r.db.QueryRow(query, user.Name, user.Lastname, user.Username, user.Email, user.Password).Scan(&user.Created, &user.ID)

	if err != nil {
		log.Println("Fehler beim Insert", err)
		return err
	}
	log.Print("Neuer User", user.Name)
	return nil
}
