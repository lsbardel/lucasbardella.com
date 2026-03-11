CFD_IMAGE=cfd

.PHONY: help
help:
	@echo ======================================================================================
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'
	@echo ======================================================================================


.PHONY: install-tex
install-tex:		## Install texlive dependencies
	@./extra/ubuntu-install

.PHONY: cv
cv:			## build CV
	@cd cv &&\
	pdflatex luca-sbardella-cv.tex &&\
	mv luca-sbardella-cv.pdf ../content/data/luca-sbardella-cv.pdf

.PHONY: py-install
py-install:		## Install python dependencies
	@uv sync --all-extras

.PHONY: py-lint
py-lint:		## Lint python code
	@uv run .dev/py-lint fix

.PHONY: rs-lint
rs-lint:		## Lint rust code
	@uv run .dev/rs-lint fix

.PHONY: clean
clean:			## Remove observable cache files
	@rm -rf content/.observablehq/cache
	@rm -rf dist

.PHONY: phd
phd:			## Download phd thesis
	curl -L -o dist/phd-thesis.pdf https://raw.githubusercontent.com/lsbardel/phd/main/thesis/thesis.pdf

.PHONY: cfd-build
cfd-build:		## Build the CFD Docker image
	@docker build -f cfd/dev/Dockerfile -t $(CFD_IMAGE) .

.PHONY: cfd-shell
cfd-shell:		## Run a bash shell in the CFD Docker image
	@docker run --rm -it -v $(PWD)/cfd:/workspace/cfd $(CFD_IMAGE) bash
