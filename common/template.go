package common

import (
	"embed"
	"html/template"
)

//go:embed public
var FS embed.FS

func LoadTemplate() *template.Template {
	var funcMap = template.FuncMap{
		"unescape": UnescapeHTML,
	}
	t := template.Must(template.New("").Funcs(funcMap).ParseFS(FS, "public/*.html"))
	return t
}
