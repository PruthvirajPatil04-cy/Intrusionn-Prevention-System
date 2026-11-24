.PHONY: help build up down test lint clean

help:
	@echo "Intrusion Prevention System (IPS) Build Commands:"
	@echo "  make up          - Start all services (Engine + Web Portal) via Docker Compose"
	@echo "  make down        - Stop and tear down all Docker Compose services"
	@echo "  make build       - Build local Next.js portal and test Python dependencies"
	@echo "  make test        - Run Python pytest and Playwright/Node E2E tests"
	@echo "  make lint        - Run ruff linter and Next.js ESLint"

build:
	cd ipp-blueprint && npm run build

up:
	docker compose up -d --build

down:
	docker compose down

test:
	cd Intrusion-Detection_system && python -m pytest
	cd ipp-blueprint && npm run test && npm run test:e2e

lint:
	cd Intrusion-Detection_system && python -m ruff check .
	cd ipp-blueprint && npm run lint

clean:
	rm -rf ipp-blueprint/.next Intrusion-Detection_system/__pycache__
