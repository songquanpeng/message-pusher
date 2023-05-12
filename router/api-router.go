package router

import (
	"github.com/gin-gonic/gin"
	"message-pusher/controller"
	"message-pusher/middleware"
)

func SetApiRouter(router *gin.Engine) {
	apiRouter := router.Group("/api")
	apiRouter.Use(middleware.GlobalAPIRateLimit())
	{
		apiRouter.GET("/status", controller.GetStatus)
		apiRouter.GET("/notice", controller.GetNotice)
		apiRouter.GET("/about", controller.GetAbout)
		apiRouter.GET("/verification", middleware.CriticalRateLimit(), middleware.TurnstileCheck(), controller.SendEmailVerification)
		apiRouter.GET("/reset_password", middleware.CriticalRateLimit(), middleware.TurnstileCheck(), controller.SendPasswordResetEmail)
		apiRouter.GET("/register_client/:username", middleware.CriticalRateLimit(), controller.RegisterClient)
		apiRouter.POST("/user/reset", middleware.CriticalRateLimit(), controller.ResetPassword)
		apiRouter.GET("/oauth/github", middleware.CriticalRateLimit(), controller.GitHubOAuth)
		apiRouter.GET("/oauth/wechat", middleware.CriticalRateLimit(), controller.WeChatAuth)
		apiRouter.GET("/oauth/wechat/bind", middleware.CriticalRateLimit(), middleware.UserAuth(), controller.WeChatBind)
		apiRouter.GET("/oauth/email/bind", middleware.CriticalRateLimit(), middleware.UserAuth(), controller.EmailBind)

		userRoute := apiRouter.Group("/user")
		{
			userRoute.POST("/register", middleware.CriticalRateLimit(), middleware.TurnstileCheck(), controller.Register)
			userRoute.POST("/login", middleware.CriticalRateLimit(), controller.Login)
			userRoute.GET("/logout", controller.Logout)

			selfRoute := userRoute.Group("/")
			selfRoute.Use(middleware.UserAuth())
			{
				selfRoute.GET("/self", controller.GetSelf)
				selfRoute.PUT("/self", controller.UpdateSelf)
				selfRoute.DELETE("/self", controller.DeleteSelf)
				selfRoute.GET("/token", controller.GenerateToken)
			}

			adminRoute := userRoute.Group("/")
			adminRoute.Use(middleware.AdminAuth())
			{
				adminRoute.GET("/", controller.GetAllUsers)
				adminRoute.GET("/search", controller.SearchUsers)
				adminRoute.GET("/:id", controller.GetUser)
				adminRoute.POST("/", controller.CreateUser)
				adminRoute.POST("/manage", controller.ManageUser)
				adminRoute.PUT("/", controller.UpdateUser)
				adminRoute.DELETE("/:id", controller.DeleteUser)
			}
		}
		optionRoute := apiRouter.Group("/option")
		optionRoute.Use(middleware.RootAuth())
		{
			optionRoute.GET("/", controller.GetOptions)
			optionRoute.PUT("/", controller.UpdateOption)
		}
		messageRoute := apiRouter.Group("/message")
		{
			messageRoute.GET("/", middleware.UserAuth(), controller.GetUserMessages)
			messageRoute.GET("/stream", middleware.UserAuth(), middleware.SetSSEHeaders(), controller.GetNewMessages)
			messageRoute.GET("/search", middleware.UserAuth(), controller.SearchMessages)
			messageRoute.GET("/status/:link", controller.GetMessageStatus)
			messageRoute.POST("/resend/:id", middleware.UserAuth(), controller.ResendMessage)
			messageRoute.GET("/:id", middleware.UserAuth(), controller.GetMessage)
			messageRoute.DELETE("/", middleware.RootAuth(), controller.DeleteAllMessages)
			messageRoute.DELETE("/:id", middleware.UserAuth(), controller.DeleteMessage)
		}
		channelRoute := apiRouter.Group("/channel")
		channelRoute.Use(middleware.UserAuth())
		{
			channelRoute.GET("/", controller.GetAllChannels)
			channelRoute.GET("/search", controller.SearchChannels)
			channelRoute.GET("/:id", controller.GetChannel)
			channelRoute.POST("/", controller.AddChannel)
			channelRoute.PUT("/", controller.UpdateChannel)
			channelRoute.DELETE("/:id", controller.DeleteChannel)
		}
		webhookRoute := apiRouter.Group("/webhook")
		webhookRoute.Use(middleware.UserAuth())
		{
			webhookRoute.GET("/", controller.GetAllWebhooks)
			webhookRoute.GET("/search", controller.SearchWebhooks)
			webhookRoute.GET("/:id", controller.GetWebhook)
			webhookRoute.POST("/", controller.AddWebhook)
			webhookRoute.PUT("/", controller.UpdateWebhook)
			webhookRoute.DELETE("/:id", controller.DeleteWebhook)
		}
	}
	pushRouter := router.Group("/push")
	pushRouter.Use(middleware.GlobalAPIRateLimit())
	{
		pushRouter.GET("/:username", controller.GetPushMessage)
		pushRouter.POST("/:username", controller.PostPushMessage)
	}
	webhookRouter := router.Group("/webhook")
	webhookRouter.Use(middleware.GlobalAPIRateLimit())
	{
		webhookRouter.POST("/:link", controller.TriggerWebhook)
	}
}
