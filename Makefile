.PHONY: setup data train evaluate api web demo test lint

setup:
	@echo "Setting up dependencies..."
	npm install
	cd apps/api && python -m venv venv && .\\venv\\Scripts\\Activate.ps1 && pip install -r requirements.txt
	@echo "Setup complete."

data:
	@echo "Generating synthetic data..."
	cd ml && python -m synth.generate_ehr
	cd ml && python -m synth.cgm_simulator
	@echo "Data generation complete."

train:
	@echo "Building features and training models..."
	cd ml && python -m features.build_windows
	cd ml && python -m models.train
	@echo "Training complete."

evaluate:
	@echo "Evaluating models..."
	cd ml && python -m models.evaluate
	@echo "Evaluation complete."

api:
	@echo "Starting API..."
	cd apps/api && .\\venv\\Scripts\\Activate.ps1 && uvicorn app.main:app --reload

web:
	@echo "Starting Web app..."
	npm run dev

demo:
	@echo "Running demo..."
	docker-compose -f infra/docker/docker-compose.yml up --build -d
	@echo "Demo is running. Web at :3000, API at :8000"

test:
	npx turbo run test

lint:
	npx turbo run lint
