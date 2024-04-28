<template>
	<view class="wrapper">
		<u-modal :show="checkinAddShow" title="开始新签到" closeOnClickOverlay :showConfirmButton="false"
			:showCancelButton="false" @cancel="checkinAddShow=false;courseChooseShow=false;checkinMethodShow=false;"
			@close="checkinAddShow=false;courseChooseShow=false;checkinMethodShow=false;">
			<u--form labelPosition="left" :model="form" labelWidth="120">
				<u-form-item label="签到课程" prop="courseId" borderBottom @click="courseChooseShow = true; "
					style="width: 100%;">
					<text>{{!!form.courseId?form.courseName:'请选择'}}</text>
					<u-icon slot="right" name="arrow-right"></u-icon>
				</u-form-item>
				<u-form-item label="课程教师" prop="teacherId" borderBottom style="width: 100%;">
					<text>{{form.teacherName}}</text>
				</u-form-item>
				<u-form-item label="持续时间(分钟)" prop="duration" borderBottom style="width: 100%;">
					<u-number-box :min="5" :max="30" :step="1" integer v-model="duration"></u-number-box>
					<u-icon slot="right" name="arrow-right"></u-icon>
				</u-form-item>
				<u-form-item label="签到方法" prop="method" borderBottom @click="checkinMethodShow = true; "
					style="width: 100%;">
					<text>{{!!form.method?form.methodName:'请选择'}}</text>
					<u-icon slot="right" name="arrow-right"></u-icon>
				</u-form-item>

				<u-button v-if="form.method" shape="circle" class="margin-top:10px;" type="primary"
					:text="`立即发起${duration}分钟的${form.methodName}`" @click="addCheckInConfirm"></u-button>

			</u--form>
		</u-modal>

		<u-popup mode="bottom" :show="courseChooseShow" :round="8" :overlay="true" @close="courseChooseShow=false"
			closeable="true" :zIndex="999999">
			<view class="course-view">
				<view class="title">选择你的课程</view>
				<view class="border" v-for="(item,index) in courseChooseList" :key="index" @click.stop="myCourse(item)">
					<view class="name text-blue">{{item.name}}</view>
					<view class="time text-gray">上课时间：{{item.time}}</view>
					<image class="image" :src="BASE_URL+item.cover"></image>
				</view>
			</view>
		</u-popup>
		<u-datetime-picker :show="checkinTimeShow" v-model="form.startTime" mode="datetime" closeOnClickOverlay
			@cancel="checkinTimeShow=false" @close="checkinTimeShow=false"></u-datetime-picker>
		<u-picker :show="checkinMethodShow" :columns="checkinMethodActions" keyName="dictLabel"
			@confirm="checkinMethodConfirm"></u-picker>
		<text class="title text-blue">云端课堂</text>
		<u-notice-bar text="欢迎使用云端课堂,这里是显示系统、教师发布的通知" custom-style="margin:20px 0"></u-notice-bar>
		<text class="sub-title text-black">我的课堂</text>

		<view class="tool" v-if="roleKey!=='student'" @click="toCreateCheckin">发起签到</view>
		<view class="tool" v-if="roleKey==='student'&&checkInfoNow==null" @click="checkMyCheckin">查询签到</view>
		<view class="tool" v-if="roleKey!=='student'" @click="toMyApprove">我的审批（<span
				:class="approvalNum?`approval-num`:''">{{approvalNum}}</span>）</view>
		<view class="tool" v-else @click="toCreateApprove">发起审批</view>
		<view class="tool" v-if="roleKey==='student'" @click="toStudentApprove">我的审批</view>

		<view v-if="checkInfoNow!=null" class="check-in-box" @click="checkInDetail">
			<view class="name text-black">{{checkInfoNow.courseName}}</view>
			<view class="teacher text-grey">{{checkInfoNow.teacherName}}</view>
			<view class="right">
				<view class="method">{{checkInfoNow.methodName}}</view>
				<u-count-down ref="countDown1" v-if="!!checkInfoNow.timeDiff&&finalTime==0"
					:time="checkInfoNow.timeDiff" @finish="timeDiffFinish" format="mm:ss"></u-count-down>
				<u-count-down v-else :time="finalTime" format="[迟到]mm:ss" @finish="checkInfoNow=null"></u-count-down>
			</view>

		</view>
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
		getRecordNum
	} from '@/api/approval/record'
	import {
		getNotificationNum
	} from '@/api/notification/info'
	export default {
		onShow() {
			this.getDict()
			this.getCourseList()
			this.getCheckIn()
			this.getNotification()
			if (this.roleKey !== 'student') {
				this.getMyApprovel()
			}
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
				roleKey: '',
				BASE_URL: '',
				duration: 5,
				finalTime: 0,
				form: {},
				checkinMethodShow: false,
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
			getNotification() {
				getNotificationNum({
					recipientId: this.$store.state.user.user.userId
				}).then(res => {
					if (!!res.data && res.data !== 0) {
						uni.setTabBarBadge({
							index: 2,
							text: res.data + ""
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
			timeDiffFinish() {
				console.log('结束');
				const time1 = new Date().getTime();
				const time2 = new Date(this.checkInfoNow.endTime).getTime();
				console.log(time1 - time2);
				if (Math.abs(time1 - time2) > 300000) {
					this.checkInfoNow = null
					return
				}
				this.finalTime = 300000 - (Math.abs(time1 - time2));
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
							if (Math.abs(time1 - time2) > 300000) {
								this.checkInfoNow = null
								return
							}
							this.finalTime = 300000 - (Math.abs(time1 - time2));

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
				this.form = {}
				this.form.teacherId = this.$store.state.user.user.userId
				this.form.teacherName = this.$store.state.user.user.nickName

				this.checkinAddShow = true
			},
			addCheckInConfirm() {
				this.form.id = uni.$u.guid(20)
				const date = new Date()
				this.form.startTime = parseTime(date)
				date.setMinutes(date.getMinutes() + this.duration)
				this.form.endTime = parseTime(date)
				addCheckin(this.form).then(res => {
					this.$modal.msgSuccess(res.msg)
					this.checkinAddShow = false
					this.getCheckIn()
				})
			},
			getCourseList() {
				listInfoApp({
					teacherId: this.$store.state.user.user.userId
				}).then(res => {
					this.courseChooseList = res.data
				})

			},
			myCourse(item) {
				this.form.courseId = item.id
				this.form.courseName = item.name
				this.courseChooseShow = false
			},
			checkinMethodConfirm(e) {
				const index = e.indexs[0]
				this.form.method = this.checkinMethodActions[0][index].dictValue
				this.form.methodName = this.checkinMethodActions[0][index].dictLabel
				this.checkinMethodShow = false
			},
			checkInDetail() {
				this.$tab.navigateToWithParams(`/pages/checkin/checkin`, {
					id: this.$store.state.user.user.userId,
					courseId: this.checkInfoNow.courseId,
					roleKey: this.$store.state.user.user.roles[0].roleKey,
					checkinId: this.checkInfoNow.id
				})

			},
			toCreateApprove() {
				this.$tab.navigateTo(`/pages/approve/create`)
			},
			getMyApprovel() {
				getRecordNum(this.$store.state.user.user.userId).then(res => {
					this.approvalNum = res.data
				})
			},
			toMyApprove() {
				this.$tab.navigateTo(`/pages/approve/approve`)
			},
			toStudentApprove() {

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