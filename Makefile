.PHONY: test-docker-env
test-docker-env:
	./testenv/docker/run_env.sh

.PHONY: run-backend
run-backend:
	go run main.go

# Front-end app commands

.PHONY: run-frontend
run-frontend:
	cd ./ui/drom-de && npm run dev

.PHONY: build-frontend
build-frontend:
	cd ./ui/drom-de && npm run build

.PHONY: run-app
run-app: run-backend run-frontend