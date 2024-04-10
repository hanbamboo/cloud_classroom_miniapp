<template>
	<view >
		<view class="title">
			<view class="courseName text-black">{{checkInfoNow.courseName}}</view>
			<view class="teacherName text-grey">{{checkInfoNow.teacherName}}</view>
		</view>
		<u-button type="primary"><u-count-down :time="checkInfoNow.timeDiff" format="mm:ss"></u-count-down></u-button>
	</view>
</template>

<script>
	import wsRequest from '@/utils/websocket'

	import config from '@/config'
	import {
		getCurrentCheckin
	} from '@/api/checkin/checkin'
	import {
		listRecordApp
	}
	from '@/api/course/record'
	export default {
		data() {
			return {
				mineId: null,
				roleKey: null,
				courseId: null,
				checkInfoNow: null,
				courseInfo: null,
				socket: null,
				student:[],
			};
		},
		onLoad(option) {
			this.mineId = option.id
			this.roleKey = option.roleKey
			this.courseId = option.courseId
			this.getCheckIn()
			this.getStudent()
			this.socket = new wsRequest(
				'ws://127.0.0.1:8080/webSocket/' + option.courseId + "@" + option.id,
				10000
			);
			
			this.watchSocket();
		},
		destroyed() {

		},
		onReady() {

		},
		methods: {
			getStudent(){
				listRecordApp({
					courseId:this.courseId
				}).then(res=>{
					this.student = res.data
				})
			},
			watchSocket() {
				this.socket.getMessage(opt => {
					// console.warn("消息接收：", opt);
					switch (opt.msgType) {
						case 'heartbeat_ping':
							const pong = {
								"message": "keep living",
								"msgType": "heartbeat_pong",
								"sessionId": msg.sessionId,
								"userId": this.mineId
							}
							this.socket.send(JSON.stringify(pong));
							break;
						case 'heartbeat_pong':
							break;
					}
				})
			},
			getCheckIn() {
				getCurrentCheckin({
					roleKey: this.roleKey,
					teacherId: this.mineId
				}).then(res => {
					if (!!res.data) {
						this.checkInfoNow = res.data
						const time1 = new Date().getTime();
						const time2 = new Date(this.checkInfoNow.endTime).getTime();
						const timeDiff = time2 - time1
						this.checkInfoNow.timeDiff = Math.abs(time2 - time1);
						const checkinReady = {
							"message": {
								courseId:res.data.courseId,
								checkId:res.data.id,
								method:res.data.method
							},
							"msgType": "checkin_ready",
							"userId": this.mineId
						}
						this.socket.send(JSON.stringify(checkinReady))
						if (timeDiff <= 0) {
							this.checkInfoNow = null
						}
					}
				})
			},
		}
	}
</script>
<style scoped lang="scss">
	.title {
		margin: 35px;

		.courseName {
			font-weight: bold;
			font-size: 24px;
			text-align: center;
			letter-spacing: 2px;
		}

		.teacherName {
			font-size: 18px;
			text-align: center;

		}
	}


	::v-deep .u-button--primary {
		height: 200px !important;
		width: 200px !important;
		border-radius: 100px !important;
		box-shadow: 0px 0px 30px 10px #B3C0F4;

	}

	::v-deep .u-count-down__text {
		font-size: 60px !important;
		color: white !important;
		font-weight: bold !important;
	}
</style>
<style lang="scss">
	page {
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		background-color: #fff;
		min-height: 100%;
		height: auto;
	}
</style>