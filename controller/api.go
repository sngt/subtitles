package controller

import (
	"net/http"

	"io/ioutil"
	"os"
	"strconv"
	"strings"

	"regexp"

	"github.com/labstack/echo"
	"github.com/sngt/subtitles/model"
)

// SrtList srtファイルの一覧を返却する
func SrtList(c echo.Context) error {
	dirs, err := ioutil.ReadDir(model.AppConfig.SrtDirPath)
	if err != nil {
		return c.String(http.StatusInternalServerError, "Cannot read srt files")
	}

	list := []srtFileResult{}
	for _, dirInfo := range dirs {
		if dirInfo.IsDir() == false {
			continue
		}

		var files []os.FileInfo
		files, err = ioutil.ReadDir(model.AppConfig.SrtDirPath + "/" + dirInfo.Name())
		for _, fileInfo := range files {
			if fileInfo.IsDir() || strings.HasSuffix(fileInfo.Name(), ".srt") == false {
				continue
			}

			list = append(list, srtFileResult{Dir: dirInfo.Name(), Name: fileInfo.Name()})
		}
	}

	return c.JSON(http.StatusOK, list)
}

type srtFileResult struct {
	Dir  string `json:"dir"`
	Name string `json:"name"`
}

const srtBlockMinLines = 3

const breakCode = "\n"

var breakCodeRegexp = regexp.MustCompile(`[\n\r(\r\n)]`)

// SrtContent srtファイルの中身を返却する
func SrtContent(c echo.Context) error {
	dir := c.QueryParam("dir")
	if dir == "" || strings.Contains(dir, "/") || strings.Contains(dir, "..") {
		return c.String(http.StatusBadRequest, "Bad dir.")
	}
	name := c.QueryParam("name")
	if name == "" || strings.Contains(name, "/") || strings.HasSuffix(name, ".srt") == false {
		return c.String(http.StatusBadRequest, "Bad name.")
	}

	bytes, err := ioutil.ReadFile(model.AppConfig.SrtDirPath + "/" + dir + "/" + name)
	if err != nil {
		return c.String(http.StatusBadRequest, "Bad path.")
	}
	bodies := string(breakCodeRegexp.ReplaceAll(bytes, []byte(breakCode)))

	blocks := []srtBlockResult{}
	for _, body := range strings.Split(bodies, "\n\n\n\n") {
		lines := strings.Split(strings.Trim(body, " \n"), "\n\n")

		if len(lines) < srtBlockMinLines {
			continue
		}

		number, _ := strconv.Atoi(lines[0])
		blocks = append(blocks, srtBlockResult{
			Number: number,
			Text:   strings.Join(lines[2:], breakCode),
		})
	}

	return c.JSON(http.StatusOK, blocks)
}

type srtBlockResult struct {
	Number int    `json:"number"`
	Text   string `json:"text"`
}
