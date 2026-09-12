CFD_IMAGE=cfd

.PHONY: help
help:
	@echo ======================================================================================
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'
	@echo ======================================================================================

.PHONY: astro-build
astro-build: astro-install	## Build the Astro spike into astro-spike/dist
	@cd astro-spike && npm run build

.PHONY: astro-dev
astro-dev: astro-install	## Serve the Astro spike with hot reload on 4069 (not production output)
	@cd astro-spike && npm run dev

.PHONY: astro-install
astro-install:		## Install the Astro spike dependencies
	@test -d astro-spike || { echo "astro-spike/ is missing, it is an untracked spike"; exit 1; }
	@cd astro-spike && npm install --no-audit --no-fund --silent

.PHONY: astro-preview
astro-preview: astro-build	## Serve the built Astro spike on 4069 (real page weights)
	@cd astro-spike && npm run preview

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
clean:			## Remove observable cache files
	@rm -rf content/.observablehq/cache
	@rm -rf dist

.PHONY: cv
cv: cv-sync		## Build CV pdf from content/cv.md
	@cd cv &&\
	pdflatex -interaction=batchmode luca-sbardella-cv.tex &&\
	pdflatex -interaction=batchmode luca-sbardella-cv.tex &&\
	mv luca-sbardella-cv.pdf ../content/data/luca-sbardella-cv.pdf

.PHONY: cv-sync
cv-sync:		## Generate the LaTeX CV sources from content/cv.md
	@uv run ls cv-sync

.PHONY: dev
dev:			## Serve the site with hot reload on 4068 (observable preview)
	@npm run dev

.PHONY: heatmap-sources
heatmap-sources:	## Refresh the TradingView market list for the heatmap page
	@npm run heatmap-sources

.PHONY: heatmap-validate
heatmap-validate:	## Check which heatmap markets actually load (needs Chrome, slow)
	@npm run heatmap-validate

.PHONY: install-tex
install-tex:		## Install texlive dependencies
	@./extra/ubuntu-install

.PHONY: phd
phd:			## Download phd thesis
	curl -L -o dist/phd-thesis.pdf https://raw.githubusercontent.com/lsbardel/phd/main/thesis/thesis.pdf

.PHONY: py-install
py-install:		## Install python dependencies
	@uv sync --all-extras

.PHONY: py-lint
py-lint:		## Lint python code
	@uv run .dev/py-lint fix

.PHONY: py-test
py-test:		## Run python tests (CFD tests run in docker via cfd-test)
	@uv run --extra dev pytest lspy/tests

.PHONY: rs-lint
rs-lint:		## Lint rust code
	@uv run .dev/rs-lint fix
