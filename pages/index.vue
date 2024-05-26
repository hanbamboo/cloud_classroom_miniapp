<template>
	<view class="wrapper">
		<u-modal :show="checkinAddShow" title="请输入签到密码" closeOnClickOverlay :show-confirm-button="false"
			:showCancelButton="false" @cancel="checkinAddShow=false;courseChooseShow=false;checkinMethodShow=false;"
			@close="checkinAddShow=false;courseChooseShow=false;checkinMethodShow=false;">
      <div class="display">
        <u-code-input v-model="pwd" :maxlength="4" mode="line"></u-code-input>
        <u-button shape="circle" class="margin-top:10px;" type="primary"
                  text="确认密码" @click="confirmCheckPwd"></u-button>
      </div>

		</u-modal>
    <u-overlay :show="imageView" @click="imageView = false">
      <view class="overlay-warp">
        <canvas style="width: 300px; height: 300px;" canvas-id="myQrcode"></canvas>
      </view>
    </u-overlay>
    <div class="flex top">
      <text class="title text-blue">云端课堂
      </text>
      <u-icon  name="scan" color="#2979ff" size="28" @click="scan"></u-icon>

    </div>

		<u-notice-bar text="欢迎使用云端课堂,这里是显示系统、教师发布的通知" custom-style="margin:20px 0"></u-notice-bar>
		<text class="sub-title text-black">我的课堂</text>

		<view class="tool" v-if="roleKey!=='student'" @click="toCreateCheckin">发起签到</view>
		<view class="tool" v-if="roleKey==='student'&&checkInfoNow==null" @click="checkMyCheckin">查询签到</view>
		<view class="tool" v-if="roleKey!=='student'" @click="toCreateNotification">发布通知</view>
		<view class="tool" v-if="roleKey==='student'" @click="toCreateApprove">发起审批</view>
		<view class="tool" @click="toMyApprove">我的审批（<span
				:class="approvalNum?`approval-num`:''">{{approvalNum}}</span>）</view>

		<view v-if="checkInfoNow!=null&&(checkInfoNow.method===3&&roleKey!=='student')||checkInfoNow!=null&&checkInfoNow.method!==3" class="check-in-box" @click.stop="checkInDetail">
			<view class="name text-black">{{checkInfoNow.courseName}}</view>
			<view class="teacher text-grey">{{checkInfoNow.teacherName}}</view>
			<view class="right">
				<view class="method">{{checkInfoNow.methodName}}</view>
				<u-count-down ref="countDown1" v-if="!!checkInfoNow.timeDiff&&finalTime==0"
					:time="checkInfoNow.timeDiff" @finish="timeDiffFinish" format="mm:ss"></u-count-down>
				<u-count-down v-else :time="finalTime" format="[迟到]mm:ss" @finish="checkInfoNow=null"></u-count-down>
      </view>

		</view>
    <view class="tool" v-if="checkInfoNow!=null&&checkInfoNow.method===3" @click="showQrcodeImage">查看二维码</view>
	</view>
</template>

<script>
	import wsRequest from '@/utils/websocket'
	import config from '@/config'
	import {
		addCheckin,
		getCurrentCheckin
	} from '@/api/checkin/checkin'
	import {
		getDictInfo
	} from '@/api/system/dict'
	import {
		listInfoApp
	} from '@/api/course/info'
	import {
		parseTime
	} from '@/utils/ruoyi'
	import {
		getRecordNum,getRecordApp
	} from '@/api/approval/record'
	import {
		getNotificationNum
	} from '@/api/notification/info'
  import drawQrcode from 'weapp-qrcode'

  export default {
		onShow() {
			this.getDict()
			this.getCourseList()
			this.getCheckIn()
			this.getNotification()
			this.getMyApprovel()

		},
		onLoad: function() {
			console.log(this.$store.state.user);
			this.roleKey = this.$store.state.user.user.roles[0].roleKey
			const url = 'ws://127.0.0.1:8080/webSocket/' + this.$store.state.user.user.userId
			const time = 5000; // 假设时间为5000毫秒

			wsRequest.init(url, time);

			this.watchSocket();

		},
		onReady() {
			this.BASE_URL = config.baseUrl


		},
		data() {
			return {
        src:'',
				roleKey: '',
				BASE_URL: '',
				duration: 5,
				finalTime: 0,
				pwd:'',
				checkinMethodShow: false,
        imageView: false,
				checkinAddShow: false,
				checkinTimeShow: false,
				courseChooseShow: false,
				checkinMethodActions: [],
				courseChooseList: [],
				checkInfoNow: null,
				approvalNum: 0,

			}
		},
		methods: {
      confirmCheckPwd(){
        const checkInfoPwd = JSON.parse(this.checkInfoNow.source).pwd
        if(!this.pwd || this.pwd!==checkInfoPwd){
          this.$modal.showToast("密码错误")
          return
        }
        this.checkinAddShow = false
        this.toCheck()
      },
			getNotification() {
				getNotificationNum({
					recipientId: this.$store.state.user.user.userId
				}).then(res => {
					if (!!res.data && res.data !== 0) {
						uni.setTabBarBadge({
							index: 2,
							text: res.data + ""
						})
					} else {
						uni.removeTabBarBadge({
							index: 2
						})
					}
				})
			},
			checkMyCheckin() {
				this.$modal.loading("加载中")
				this.getCheckIn()
				this.$modal.closeLoading()
				if (this.checkInfoNow == null) {
					this.$modal.showToast("暂无最新签到")
				}
			},
			watchSocket() {
				wsRequest.getMessage(opt => {
					// console.warn("消息接收：", opt);
					const data = JSON.parse(opt.data)
					switch (data.msgType) {
						case 'heartbeat_ping':
							const pong = {
								"message": "keep living",
								"msgType": "heartbeat_pong",
								"userId": this.mineId
							}
							wsRequest.send(JSON.stringify(pong));
							break;
						case 'heartbeat_pong':
							break;

					}
				})
			},
      scan(){
        const that = this
        wx.scanCode({
          success(res) {
            const data = JSON.parse(res.result)
            console.log(data)
            if(data.type==='checkin'&&data.method===3){
              const now = new Date()
              //判断 now 是否已经超过endTIme的时间
              if(now.getTime()>new Date(data.expire).getTime()){
                that.$modal.showToast('签到已结束')
              }else{
                that.toCheck(data.courseId,data.checkinId)
              }
            }
          }
        })
      },
			timeDiffFinish() {
				console.log('结束');
				const time1 = new Date().getTime();
				const time2 = new Date(this.checkInfoNow.endTime).getTime();
				console.log(time1 - time2);
				if (Math.abs(time1 - time2) > 30000) {
					this.checkInfoNow = null
					return
				}
				this.finalTime = 30000 - (Math.abs(time1 - time2));
				if (this.finalTime <= 0) {
					this.checkInfoNow = null
				}
			},
			getCheckIn() {
				getCurrentCheckin({
					roleKey: this.roleKey,
					teacherId: this.$store.state.user.user.userId
				}).then(res => {
					if (!!res.data) {
						this.checkInfoNow = res.data
						this.finalTime = 0
						let time1 = new Date().getTime();
						const time2 = new Date(this.checkInfoNow.endTime).getTime();
						const timeDiff = time2 - time1
						this.checkInfoNow.timeDiff = Math.abs(time2 - time1);

						if (timeDiff <= 0) {
							time1 = new Date().getTime();
							console.log(time1 - time2);
							if (Math.abs(time1 - time2) > 30000) {
								this.checkInfoNow = null
								return
							}
							this.finalTime = 30000 - (Math.abs(time1 - time2));

							if (this.finalTime < 0) {

								this.checkInfoNow = null
							}


						}
					}
				})
			},
			getDict() {
				getDictInfo('class_checkin_type').then(res => {
					this.checkinMethodActions = []
					this.checkinMethodActions.push(res.data)
				})
			},
			toCreateCheckin() {
				this.$tab.navigateToWithParams(`/pages/checkin/create`, {
					id: this.$store.state.user.user.userId,
					roleKey: this.$store.state.user.user.roles[0].roleKey,
				})
				// this.form = {}
				// this.form.teacherId = this.$store.state.user.user.userId
				// this.form.teacherName = this.$store.state.user.user.nickName
				// this.checkinAddShow = true
				// this.$forceUpdate()
			},
			getCourseList() {
				listInfoApp({
					teacherId: this.$store.state.user.user.userId
				}).then(res => {
					this.courseChooseList = res.data
				})

			},
      showQrcodeImage(){
        if(this.checkInfoNow.method===3&&this.checkInfoNow.source){
          this.imageView = true
          drawQrcode({
            width: 300,
            height: 300,
            canvasId: 'myQrcode',
            text: this.checkInfoNow.source
          })
        }
      },
			checkInDetail() {
        if(this.roleKey !== 'student'){
          this.toCheck()
          return;
        }
        if(this.checkInfoNow.method===1){
          this.checkinAddShow = true
          return
        }
        this.toCheck()
			},
      toCheck(courseId,checkinId){
        this.$tab.navigateToWithParams(`/pages/checkin/checkin`, {
          id: this.$store.state.user.user.userId,
          courseId: courseId||this.checkInfoNow.courseId,
          roleKey: this.$store.state.user.user.roles[0].roleKey,
          checkinId: checkinId||this.checkInfoNow.id
        })
      },
			toCreateApprove() {
				this.$tab.navigateTo(`/pages/approve/create`)
			},
			getMyApprovel() {
				// if(this.roleKey !== 'student'){
					// getRecordNum(this.$store.state.user.user.userId).then(res => {
					// 	this.approvalNum = res.data
					// })
				// }
				getRecordApp({
					approverId: this.$store.state.user.user.userId
				}).then(res=>{
					let data = res.data || []
					data = data.filter(item=>item.finalStatus == 0)
						let result = []
						for (var i = 0; i < data.length ; i++) {
							const m = data[i]
							if(i==0){
								result.push(m)
								continue
							}
							const s = data[i-1]
							if( m.leaveId != s.leaveId){
									result.push(m)
							}
						}
						this.approvalNum = result.length


				})

			},
			toMyApprove() {
				this.$tab.navigateTo(`/pages/approve/approve`)
			},
			toCreateNotification(){
				this.$tab.navigateTo(`/pages/notification/create`)
			}
		}
	}
</script>
<style scoped lang="scss">
	.tool {
		height: 80px;
		text-align: center;
		width: 100%;
		margin: 5px 0 10px 0;
		border: 1px solid #5473E8;
		border-radius: 8px;
		font-size: 18px;
		line-height: 80px;
		letter-spacing: 2px;

		.approval-num {
			background: #e54d42;
			color: #ffffff;
			border-radius: 8px;
			padding: 8px;
		}
	}

	.check-in-box {
		border: #5473E8 1px solid;
		border-radius: 8px;
		position: relative;
		padding: 8px;
		margin: 5px;
		background: linear-gradient(-170deg, #B3C0F4, #ffffff);

		.name {
			font-weight: bold;
			font-size: 20px;
			padding: 5px;
		}

		.teacher {
			padding: 5px;
		}
    ::v-deep .u-icon{
      display: block!important;
      position: absolute!important;
      right: 38% !important;
      top: 22% !important;
    }
		.right {
			position: absolute;
			right: 20px;
			top: 0;
			transform: translateY(40%);
			height: 50%;

			.method {
				font-size: 16px;
				padding: 5px;
				text-align: center;
			}

			::v-deep .u-count-down__text {
				color: #5473E8 !important;
				text-align: center;
				font-size: 24px;
				font-weight: bold;
			}

		}
	}

	.wrapper {
		padding: 16px;
		margin-top: 8%;

		.title {
			font-weight: bold;
			font-size: 32px;

		}

		.sub-title {
			font-weight: bold;
			font-size: 20px;

		}

	}

	::v-deep .u-form-item {
		width: 300px !important;
	}

	::v-deep .u-button {
		margin-top: 20px !important;
	}
  .top{
    ::v-deep .u-icon{
   align-items: flex-end!important;
  }}
	.course-view {
		max-height: 80%;
		overflow-y: auto;
		margin: 8px;

		.title {
			font-size: 20px;
			font-weight: bold;
			margin: 5px 5px 30px 5px;
		}

		.border {
			padding: 8px;
			border-radius: 8px;
			border: 1px solid #5473E8;
			position: relative;
			margin: 0 0 8px 0;
		}

		.name {
			font-weight: bold;
			font-size: 18px;

		}

		.image {
			padding: 8px;
			position: absolute;
			height: 100%;
			width: 100px;
			right: 0;
			top: 0;
		}
	}

  .overlay-warp{
    position: absolute;
    height: 100%;
    top: 30%;
    left: 10%;
  }
</style>
<style>
	page {
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		background-color: #fff;
		min-height: 100%;
		height: auto;
	}
</style>
