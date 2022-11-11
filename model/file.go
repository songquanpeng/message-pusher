package model

import (
	_ "gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"message-pusher/common"
	"os"
	"path"
	"strings"
)

type File struct {
	Id              int    `json:"id"`
	Filename        string `json:"filename"`
	Description     string `json:"description"`
	Uploader        string `json:"uploader"`
	Link            string `json:"link" gorm:"unique"`
	Time            string `json:"time"`
	DownloadCounter int    `json:"download_counter"`
}

func GetAllFiles() ([]*File, error) {
	var files []*File
	var err error
	err = DB.Find(&files).Error
	return files, err
}

func QueryFiles(query string, startIdx int) ([]*File, error) {
	var files []*File
	var err error
	query = strings.ToLower(query)
	err = DB.Limit(common.ItemsPerPage).Offset(startIdx).Where("filename LIKE ? or description LIKE ? or uploader LIKE ? or time LIKE ?", "%"+query+"%", "%"+query+"%", "%"+query+"%", "%"+query+"%").Order("id desc").Find(&files).Error
	return files, err
}

func (file *File) Insert() error {
	var err error
	err = DB.Create(file).Error
	return err
}

// Delete Make sure link is valid! Because we will use os.Remove to delete it!
func (file *File) Delete() error {
	var err error
	err = DB.Delete(file).Error
	err = os.Remove(path.Join(common.UploadPath, file.Link))
	return err
}

func UpdateDownloadCounter(link string) {
	DB.Model(&File{}).Where("link = ?", link).UpdateColumn("download_counter", gorm.Expr("download_counter + 1"))
}
