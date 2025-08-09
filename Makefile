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


.PHONY: lint-py
lint-py:		## Lint python code
	@uv run .dev/lint-py fix


.PHONY: clean
clean:			## Remove observable cache files
	@rm -rf content/.observablehq/cache
	@rm -rf dist

.PHONY: phd
phd:			## Build phd thesis
	@cd phd &&\
	pdflatex thesis.tex &&\
	mv thesis.pdf temp_thesis.pdf &&\
	pdftk temp_thesis.pdf cat 2-end output thesis.pdf &&\
	rm temp_thesis.pdf
