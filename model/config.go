package model

import "github.com/go-yaml/yaml"

// AppConfig アプリケーション設定
var AppConfig = config{}

type config struct {
	Port       int    `yaml:"port"`
	SrtDirPath string `yaml:"srt-path"`
}

// InitAppConfig アプリケーション設定を、設定ファイルデータで初期化する
func InitAppConfig(in []byte) {
	config := config{}
	yaml.Unmarshal(in, &config)
	AppConfig = config
}
