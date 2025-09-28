package models

type Book struct {
	ID                   int     `json:"id"`
	Author               string  `json:"author"`
	Name                 string  `json:"name"`
	Price                float64 `json:"price"`
	Genre                string  `json:"genre"`
	Description          string  `json:"description"`
	Descriptionlong      string  `json:"descriptionLong"`
	Quantity             int     `json:"quantity"`
	BorrowPrice          float64 `json:"borrowPrice"`
	DueAt                string  `json:"dueAt,omitempty"`
	ReservationExpiresAt string  `json:"reservationExpiresAt,omitempty"`
}
