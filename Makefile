.PHONY: help
help:
	@echo ======================================================================================
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'
	@echo ======================================================================================

.PHONY: upgrade-interactive
upgrade-interactive:	## Update dependencies interactively
	@yarn upgrade-interactive --latest

.PHONY: install-py
install-py:		## Install tools dependencies in virtual-env
	@pip install -U -r ./extra/tools/requirements.txt

.PHONY: install-tex
install-tex:		## Install texlive dependencies
	@./extra/ubuntu-install

.PHONY: qr
qr:			## Create QR svg image in virtualenv
	qr --factory=svg-path "https://lucasbardella.com" > ./static/luca-qr.svg
	qr "https://lucasbardella.com" > ./static/luca-qr.png

.PHONY: cv
cv:			## build CV
	@cd extra/cv &&\
	pdflatex luca-sbardella-cv.tex &&\
	mv luca-sbardella-cv.pdf ../../content/docs/luca-sbardella-cv.pdf
