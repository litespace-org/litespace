package utils

var no_threads int

func CountThreads() int {
	return no_threads
}

func IncreaseThread() {
	no_threads += 1
}

func DecreaseThread() {
	no_threads -= 1
}
