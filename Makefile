.PHONY: help docker-build docker-up docker-down docker-logs docker-dev docker-test

help:
	@echo "StyleMirror Container Automation"
	@echo "  make docker-build - Build production multi-stage web and api images"
	@echo "  make docker-up    - Start production containers in background"
	@echo "  make docker-down  - Stop and tear down running containers"
	@echo "  make docker-logs  - Stream live container logs"
	@echo "  make docker-dev   - Launch hot-reloading development compose"
	@echo "  make docker-test  - Run backend unit tests inside container environment"

docker-build:
	docker compose build

docker-up:
	docker compose up -d

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f

docker-dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

docker-test:
	docker compose run --rm api pytest app/tests
