CFD_IMAGE=cfd

.PHONY: help
help:
	@echo ======================================================================================
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'
	@echo ======================================================================================

.PHONY: build
build: install		## Build the site into dist/
	@npm run build

.PHONY: cfd-build
cfd-build:		## Build the CFD Docker image
	@docker build -f cfd/dev/cfd.dockerfile -t $(CFD_IMAGE) .

.PHONY: cfd-cases
cfd-cases:		## Run CFD cases in the Docker image
	@docker run --rm \
		-v $(PWD)/cfd:/workspace/cfd \
		$(CFD_IMAGE) \
		/project/.venv/bin/python -m cfd.cli

.PHONY: cfd-shell
cfd-shell:		## Run a bash shell in the CFD Docker image
	@docker run --rm -it \
		-v $(PWD)/cfd:/workspace/cfd \
		$(CFD_IMAGE) \
		bash

.PHONY: cfd-test
cfd-test:		## Run CFD tests inside the Docker image
	@docker run --rm \
		-v $(PWD):/workspace \
		$(CFD_IMAGE)-test \
		pytest

.PHONY: cfd-test-build
cfd-test-build:		## Build the CFD test Docker image
	@docker build -f cfd/dev/cfd-test.dockerfile -t $(CFD_IMAGE)-test .

.PHONY: clean
clean:			## Remove build output
	@rm -rf dist

.PHONY: cv
cv: cv-sync		## Build CV pdf from src/pages/cv.md
	@cd cv &&\
	pdflatex -interaction=batchmode luca-sbardella-cv.tex &&\
	pdflatex -interaction=batchmode luca-sbardella-cv.tex &&\
	mv luca-sbardella-cv.pdf ../public/assets/luca-sbardella-cv.pdf

.PHONY: cv-sync
cv-sync:		## Generate the LaTeX CV sources from src/pages/cv.md
	@uv run ls cv-sync

.PHONY: data
data:			## Run the data loaders for files that are missing
	@npm run data

.PHONY: data-force
data-force:		## Re-run every data loader, refreshing the data
	@npm run data -- --force

.PHONY: heatmap-sources
heatmap-sources:	## Refresh the TradingView market list for the heatmap page
	@npm run heatmap-sources

.PHONY: heatmap-validate
heatmap-validate:	## Check which heatmap markets actually load (needs Chrome, slow)
	@npm run heatmap-validate

.PHONY: install
install:		## Install node dependencies
	@npm install --no-audit --no-fund --silent

.PHONY: install-tex
install-tex:		## Install texlive dependencies
	@./extra/ubuntu-install

.PHONY: phd
phd:			## Download phd thesis
	curl -fL --create-dirs -o public/phd-thesis.pdf https://raw.githubusercontent.com/lsbardel/phd/main/thesis/thesis.pdf

.PHONY: py-install
py-install:		## Install python dependencies
	@uv sync --all-extras

.PHONY: py-lint
py-lint:		## Lint python code
	@uv run .dev/py-lint fix

.PHONY: py-test
py-test:		## Run python tests (CFD tests run in docker via cfd-test)
	@uv run --extra dev pytest lspy/tests

.PHONY: release
release:		## Tag the current version (from package.json) and push the tag
	$(eval VERSION := $(shell node -p "require('./package.json').version"))
	@read -p "Tagging with v$(VERSION), are you sure? [Y/n] " ans; \
	ans=$${ans:-Y}; \
	if [ "$$ans" = "Y" ] || [ "$$ans" = "y" ]; then \
		git tag -a v$(VERSION) -m "v$(VERSION)" && git push origin v$(VERSION); \
	else \
		echo "Aborted."; \
	fi

.PHONY: rs-lint
rs-lint:		## Lint rust code
	@uv run .dev/rs-lint fix

.PHONY: serve-dev
serve-dev: install	## Serve the site with hot reload on 4069
	@npm run dev

.PHONY: serve-preview
serve-preview: build	## Serve the built site on 4069, no hot reload
	@npm run preview
