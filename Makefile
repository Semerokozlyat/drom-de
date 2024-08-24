.PHONY: test-docker-env
test-docker-env:
	./testenv/docker/run_env.sh

.PHONY: run-backend
run-backend:
	go run main.go

.PHONY: run-frontend
run-frontend:
	cd ./ui/drom-de && npm run dev

.PHONY: run-app
run-app: run-backend run-frontend