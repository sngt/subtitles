package main

import (
	"html/template"
	"net/http"

	"io"
	"os"
	"time"

	"regexp"

	"fmt"

	"github.com/labstack/echo"
	"github.com/sngt/subtitles/model"
)

//go:generate go-bindata -prefix=data ./data/...

func main() {
	model.InitAppConfig(MustAsset("config/app.yaml"))

	e := echo.New()
	e.Renderer = &renderer{FileName: "view/index.html"}
	e.GET("/*", func(c echo.Context) error {
		return c.Render(http.StatusOK, "index", struct {
			Env       string
			Timestamp int64
		}{Env: os.Getenv("APP_ENV"), Timestamp: time.Now().UnixNano()})
	})

	e.Static("/js", "public/js")
	e.Static("/css", "public/css")

	e.Logger.Fatal(e.Start(fmt.Sprintf(":%d", model.AppConfig.Port)))
}

type renderer struct {
	FileName  string
	templates *template.Template
}

func (t *renderer) Render(w io.Writer, name string, data interface{}, c echo.Context) error {
	if t.templates == nil {
		body := regexp.MustCompile(`([>}])[\s]+`).ReplaceAllString(string(MustAsset(t.FileName)), "$1")
		t.templates = template.Must(template.New("index").Parse(body))
	}
	return t.templates.ExecuteTemplate(w, name, data)
}
