.PHONY: help update

help:
	@echo ======================================================================================
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'
	@echo ======================================================================================


outdated:		## Outdated dependencies
	@yarn outdated

update:			## Update dependencies
	@yarn upgrade --latest

upgrade-interactive:	## Update dependencies interactively
	@yarn upgrade-interactive --latest

install-py:		## Install tools dependencies in virtual-env
	@pip install -U -r ./extra/tools/requirements.txt

qr:			## Create QR svg image in virtualenv
	qr --factory=svg-path "https://lucasbardella.com" > ./static/luca-qr.svg
	qr "https://lucasbardella.com" > ./static/luca-qr.png
