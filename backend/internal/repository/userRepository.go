package repository

import (
	"bookbazaar-backend/internal/models"
	"database/sql"
	"log"
	"time"

	"golang.org/x/crypto/bcrypt"
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

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)

	if err != nil {
		return err
	}

	query := `INSERT INTO users ( name, lastname, username, email, password) VALUES($1, $2, $3, $4, $5) RETURNING created, id`

	err = r.db.QueryRow(query, user.Name, user.Lastname, user.Username, user.Email, string(hashedPassword)).Scan(&user.Created, &user.ID)

	if err != nil {
		log.Println("Fehler beim Insert", err)
		return err
	}
	log.Print("Neuer User", user.Name)
	return nil
}

func (r *UserRepository) ValidateUserCredentials(username, password string) (*models.User, error) {
	user, err := r.GetUserByUserName(username)
	if err != nil {
		return nil, err
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		log.Println("Fehler beim Validieren des Passwortes")
		return nil, err
	}

	return user, nil
}

func (r *UserRepository) CreateRefreshToken(userID int, tokenHash string, expiresAt time.Time) error {
	_, err := r.db.Exec(`
		INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
		VALUES ($1, $2, $3)
	`, userID, tokenHash, expiresAt)
	return err
}

func (r *UserRepository) GetUserIDByRefreshToken(tokenHash string) (int, error) {
	var userID int
	err := r.db.QueryRow(`
		SELECT user_id
		FROM refresh_tokens
		WHERE token_hash = $1
		  AND revoked = false
		  AND expires_at > now()
	`, tokenHash).Scan(&userID)
	if err != nil {
		return 0, err
	}
	return userID, nil
}

func (r *UserRepository) RevokeRefreshToken(tokenHash string) error {
	_, err := r.db.Exec(`
		UPDATE refresh_tokens
		SET revoked = true
		WHERE token_hash = $1
	`, tokenHash)
	return err
}

func (r *UserRepository) UpdateRefreshTokenLastUsed(tokenHash string) error {
	_, err := r.db.Exec(`
		UPDATE refresh_tokens
		SET last_used_at = now()
		WHERE token_hash = $1
	`, tokenHash)
	return err
}
