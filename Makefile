NAME := calorie
VERSION := $(shell git describe --tags --abbrev=0 2> /dev/null)
REVISION := $(shell git rev-parse --short HEAD)
LDFLAGS := -X 'main.version=$(VERSION)' -X 'main.revision=$(REVISION)'


.PHONY: help setup build pre-commit

## このヘルプを表示する
help:
	@make2help $(MAKEFILE_LIST)

## プロジェクトをcloneしたあと、はじめに実行する
setup:
	go get golang.org/x/tools/cmd/goimports
	go get github.com/golang/lint
	go get github.com/Masterminds/glide
	go get github.com/jteeuwen/go-bindata
	go get github.com/Songmu/make2help/cmd/make2help
	glide update
	if [ ! -e ./data/config/app.yaml ]; then echo "port: 9999\nsrt-path: ${HOME}/srt" > ./data/config/app.yaml; fi

## ビルド準備
pre-build:
	go generate
	goimports -w $$(glide novendor -x | grep -v ^.$$) ./app.go
	gofmt -w $$(glide novendor -x | grep -v ^.$$) ./app.go
	go vet $$(glide novendor)
	for pkg in $$(glide novendor -x | grep -v ^.$$) ./app.go; do golint -set_exit_status $$pkg || exit $$?; done

## 実行用ファイルを作成する
build: pre-build
	go build -ldflags "$(LDFLAGS)"

## コードをコミットする前に実行する
pre-commit: build
	glide install
	go test $$(glide novendor)
