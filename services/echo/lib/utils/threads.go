package utils

var threads_count int

func CountThreads() int {
	return threads_count
}

func IncreaseThread() {
	threads_count += 1
}

func DecreaseThread() {
	threads_count -= 1
}
