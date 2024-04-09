<template>
	<view>
		<text>{{checkInfoNow.courseName}}</text>
		<u-button @click="send" type="primary"><u-count-down :time="checkInfoNow.timeDiff"
				format="mm:ss"></u-count-down></u-button>
	</view>
</template>

<script>
	import wsRequest from '@/utils/websocket'

	import config from '@/config'
	import {
		getCurrentCheckin
	} from '@/api/checkin/checkin'
	import {
		getInfo
	}
	from '@/api/course/info'
	export default {
		data() {
			return {
				mineId: null,
				roleKey: null,
				courseId: null,
				checkInfoNow: null,
				courseInfo: null,
				socket: null,
			};
		},
		onLoad(option) {
			this.mineId = option.id
			this.roleKey = option.roleKey
			this.courseId = option.courseId
			this.getCheckIn()
			this.socket = new wsRequest(
				'ws://127.0.0.1:8080/webSocket/111',
				10000
			);

			this.watchSocket();
		},
		destroyed() {

		},
		onReady() {

		},
		methods: {
			send(){
				let data =  {value:"传输内容",method:"方法名称"};
				console.log(this.socket);
							this.socket.send( JSON.stringify(data)  );
			},
			watchSocket() {
				this.socket.getMessage(opt => {
					console.warn("消息接收：", opt);
				})
			},
			getCourseInfo() {
				getInfo(this.courseId).then(res => {
					this.courseInfo = res.data
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
						console.log(this.checkInfoNow);
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

</style>