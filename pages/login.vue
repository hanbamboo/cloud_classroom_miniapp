<template>
	<view class="normal-login-container">
		<view class="logo-content self-start justify-start flex">
			<!-- <image style="width: 100rpx;height: 100rpx;" :src="globalConfig.appInfo.logo" mode="widthFix">
			</image> -->
			<text class="title text-blue">{{globalConfig.appInfo.name}}</text>
		</view>
		<view class="login-form-content">
			<view class="input-item flex align-center">
				<u--input type="text" placeholder="请输入账号" maxlength="30" prefixIcon="account" clearable border="bottom"
					prefixIconStyle="font-size: 24px;color: #5473E8" v-model="loginForm.username" />
			</view>
			<view class="input-item flex align-center">
				<u--input type="password" placeholder="请输入密码" maxlength="20" prefixIcon="lock" clearable border="bottom"
					prefixIconStyle="font-size: 24px;color: #5473E8" v-model="loginForm.password" />
			</view>
			<view class="input-item flex align-center" v-if="captchaEnabled">
				<u-input type="number" placeholder="验证码" maxlength="4" prefixIcon="hourglass" clearable border="bottom"
					prefixIconStyle="font-size: 24px;color: #5473E8" v-model="loginForm.code">
					<template slot="suffix">
						<view class="login-code">
							<image :src="codeUrl" @click="getCode" class="login-code-img"></image>
						</view>


					</template>

				</u-input>

			</view>

			<view class="reg text-center" v-if="register">
				<text class="text-grey1" style="padding: 0 0 0 10px;">没有账号？</text>
				<text @click="handleUserRegister" class="text-blue">立即注册</text>
				<text class="find text-blue">找回密码</text>
			</view>
			<view class="action-btn">
				<button @click="handleLogin" class="login-btn cu-btn block bg-blue lg round">登录</button>
			</view>
			<view class="xieyi text-center">
				<u-divider text="使用其他方式登录"></u-divider>
				<view style="margin: 20px 0 25px 0;">
					<image src="@/static/images/wechat.png" @click="wxlogin" style="width: 40px;height: 40px;"></image>
				</view>


				<text class="text-grey1">登录即代表同意</text>
				<text @click="handleUserAgrement" class="text-blue">《用户协议》</text>与
				<text @click="handlePrivacy" class="text-blue">《隐私协议》</text>
			</view>
		</view>

	</view>
</template>

<script>
	import {
		getCodeImg
	} from '@/api/login'

	export default {
		data() {
			return {
				codeUrl: "",
				captchaEnabled: false,
				// 用户注册开关
				register: false,
				globalConfig: getApp().globalData.config,
				loginForm: {
					username: "admin",
					password: "admin123",
					code: "",
					uuid: ''
				}
			}
		},
		created() {
			this.getCode()
		},
		methods: {
			// 用户注册
			handleUserRegister() {
				this.$tab.redirectTo(`/pages/register`)
			},
			// 隐私协议
			handlePrivacy() {
				let site = this.globalConfig.appInfo.agreements[0]
				this.$tab.navigateTo(`/pages/common/webview/index?title=${site.title}&url=${site.url}`)
			},
			// 用户协议
			handleUserAgrement() {
				let site = this.globalConfig.appInfo.agreements[1]
				this.$tab.navigateTo(`/pages/common/webview/index?title=${site.title}&url=${site.url}`)
			},
			// 获取图形验证码
			getCode() {
				getCodeImg().then(res => {
					this.captchaEnabled = res.captchaEnabled === undefined ? true : res.captchaEnabled
					if (this.captchaEnabled) {
						this.codeUrl = 'data:image/gif;base64,' + res.img
						this.loginForm.uuid = res.uuid
					}
				})
			},
			// 登录方法
			async handleLogin() {
				if (this.loginForm.username === "") {
					this.$modal.msgError("请输入您的账号")
				} else if (this.loginForm.password === "") {
					this.$modal.msgError("请输入您的密码")
				} else if (this.loginForm.code === "" && this.captchaEnabled) {
					this.$modal.msgError("请输入验证码")
				} else {
					this.$modal.loading("登录中，请耐心等待...")
					this.pwdLogin()
				}
			},
			// 密码登录
			async pwdLogin() {
				this.$store.dispatch('Login', this.loginForm).then(() => {
					this.$modal.closeLoading()
					this.loginSuccess()
				}).catch(() => {
					if (this.captchaEnabled) {
						this.getCode()
					}
				})
			},
			// 登录成功后，处理函数
			loginSuccess(result) {
				// 设置用户信息
				this.$store.dispatch('GetInfo').then(res => {
					this.$tab.reLaunch('/pages/index')
				})
			},
			wxlogin() {
				uni.getProvider({
					service: 'oauth',
					success: (res) => {
						if (~res.provider.indexOf('weixin')) { //支持微信、qq和微博等
							uni.login({
								provider: 'weixin',
								success: (loginRes) => {
									console.log(111,loginRes);
									uni.getUserProfile ({
										provider: 'weixin',
										success: (userInfoRes) => {
											console.log(222, userInfoRes)
										}
									})
								}
							})
						}
					}
				})
			}
		}
	
	}
</script>
<style scoped>
	::v-deep .u-input__content__field-wrapper {
		margin-left: 12px !important;
		margin-bottom: 5px;
	}

	::v-deep .u-input__content {
		padding-bottom: 8px;
	}
</style>
<style lang="scss">
	page {
		background-color: #ffffff;
	}

	.normal-login-container {
		width: 100%;

		.logo-content {
			width: 100%;
			font-size: 38px;
			text-align: start;
			padding-top: 20%;

			image {
				border-radius: 4px;
			}

			.title {
				margin-left: 10%;
				font-weight: bold;
			}
		}

		.login-form-content {
			text-align: center;
			margin: 20px auto;
			margin-top: 15%;
			width: 90%;

			.input-item {
				padding: 10px;
				margin: 20px auto;
				// background-color: #f5f6f7;
				height: 38px;

				// border-radius: 10px;
				input {
					font-size: 16px !important;
					list-height: 18px !important;
				}

				.login-code {
					height: 38px;

					.login-code-img {
						height: 38px;
						position: absolute;
						right: 10%;
						margin-left: 10px;
						width: 200rpx;
					}
				}
			}

			.login-btn {
				margin: 25px 15px 0 10px;
				height: 45px;
				font-size: 18px !important;
			}

			.reg {
				text-align: start;
				margin-top: 15px;
				font-size: 16px !important;
				list-height: 18px !important;
				height: 18px;

				.find {
					position: absolute;
					right: 7%;
				}


			}

			.xieyi {
				color: #333;
				width: 90%;
				bottom: 5%;
				right: 5%;
				position: absolute;
			}


		}
	}
</style>