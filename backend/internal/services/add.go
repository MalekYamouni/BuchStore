package services

import "errors"

func Add(a, b int) (int, error) {
	if a < 0 || b < 0 {
		return 0, errors.New("no negatives allowed")
	}
	return a + b, nil
}
