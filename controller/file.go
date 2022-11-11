package controller

import (
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"message-pusher/common"
	"message-pusher/model"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

type FileDeleteRequest struct {
	Id   int
	Link string
	//Token string
}

func UploadFile(c *gin.Context) {
	uploadPath := common.UploadPath
	//saveToDatabase := true
	//path := c.PostForm("path")
	//if path != "" { // Upload to explorer's path
	//	uploadPath = filepath.Join(common.ExplorerRootPath, path)
	//	if !strings.HasPrefix(uploadPath, common.ExplorerRootPath) {
	//		// In this case the given path is not valid, so we reset it to ExplorerRootPath.
	//		uploadPath = common.ExplorerRootPath
	//	}
	//	saveToDatabase = false
	//}

	description := c.PostForm("description")
	if description == "" {
		description = "无描述信息"
	}
	uploader := c.GetString("username")
	if uploader == "" {
		uploader = "匿名用户"
	}
	currentTime := time.Now().Format("2006-01-02 15:04:05")
	form, err := c.MultipartForm()
	if err != nil {
		c.String(http.StatusBadRequest, fmt.Sprintf("get form err: %s", err.Error()))
		return
	}
	files := form.File["file"]
	for _, file := range files {
		// In case someone wants to upload to other folders.
		filename := filepath.Base(file.Filename)
		link := filename
		savePath := filepath.Join(uploadPath, filename)
		if _, err := os.Stat(savePath); err == nil {
			// File already existed.
			t := time.Now()
			timestamp := t.Format("_2006-01-02_15-04-05")
			ext := filepath.Ext(filename)
			if ext == "" {
				link += timestamp
			} else {
				link = filename[:len(filename)-len(ext)] + timestamp + ext
			}
			savePath = filepath.Join(uploadPath, link)
		}
		if err := c.SaveUploadedFile(file, savePath); err != nil {
			c.String(http.StatusBadRequest, fmt.Sprintf("upload file err: %s", err.Error()))
			return
		}
		// save to database
		fileObj := &model.File{
			Description: description,
			Uploader:    uploader,
			Time:        currentTime,
			Link:        link,
			Filename:    filename,
		}
		err = fileObj.Insert()
		if err != nil {
			_ = fmt.Errorf(err.Error())
		}
	}
	c.Redirect(http.StatusSeeOther, "./")
}

func DeleteFile(c *gin.Context) {
	var deleteRequest FileDeleteRequest
	err := json.NewDecoder(c.Request.Body).Decode(&deleteRequest)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "无效的参数",
		})
		return
	}

	fileObj := &model.File{
		Id: deleteRequest.Id,
	}
	model.DB.Where("id = ?", deleteRequest.Id).First(&fileObj)
	err = fileObj.Delete()
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": err.Error(),
		})
	} else {
		message := "文件删除成功"
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": message,
		})
	}

}

func DownloadFile(c *gin.Context) {
	path := c.Param("file")
	fullPath := filepath.Join(common.UploadPath, path)
	if !strings.HasPrefix(fullPath, common.UploadPath) {
		// We may being attacked!
		c.Status(403)
		return
	}
	c.File(fullPath)
	// Update download counter
	go func() {
		model.UpdateDownloadCounter(path)
	}()
}
