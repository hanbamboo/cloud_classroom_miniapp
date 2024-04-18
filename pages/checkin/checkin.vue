<template>
	<view>
		<view class="title">
			<view class="courseName text-black">{{checkInfoNow.courseName}}</view>
			<view class="teacherName text-grey">{{checkInfoNow.teacherName}}</view>
		</view>
		<u-transition :show="true">

			<u-button v-if="isCheckIn&&checkinRecordMine.status==1" type="success">已签到</u-button>
			<u-button v-else-if="isCheckIn&&checkinRecordMine.status==2" type="warning">迟到</u-button>
			<u-button v-else-if="checkInfoNow==null" type="error">已结束</u-button>
			<u-button v-else @click="toCheckIn" :type="outTimeCheck?`warning`:`primary`"><u-count-down
					:time="checkInfoNow.timeDiff" format="mm:ss" @finish="finishCount"></u-count-down></u-button>

		</u-transition>

		<view class="afterCheckin" v-if="isCheckIn">
			<view class="time">
				签到时间：{{checkinRecordMine.checkinTime}}

			</view>
			<view class="device text-gray" v-if="deviceInfo.deviceModel">
				设备：{{deviceInfo.deviceModel}}
			</view>
		</view>
		<view class="member">
			<u-tabs :list="tabsList" :is-scroll="false" :current="tabsCurrent" bar-width="50" active-color="orange"
				@click="tabsChange" :activeStyle="{
					  color:'#5473E8',
					  fontSize:'18px',
					  fontWeight:'bold',
					  transform:'scale(1.05)',
					  
				  }" :inactiveStyle="{
				  	 color:'#aaaaaa',
					 transition:'0.3s',
				  	  transform:'scale(1)'
				  }">
			</u-tabs>
			<view v-if="tabsCurrent == 0">
				<u-loading-icon v-if="!memberList" text="加载中" textSize="18"></u-loading-icon>
				<view v-else-if="cacheMemberList.length!=0" v-for="(item,index) in cacheMemberList" key="index"
					class="member">
					<u-avatar
						:src="!!item.studentAvatar?BASE_URL + item.studentAvatar:require('@/static/images/profile.jpg')"
						size="50"></u-avatar>
					<view class="name">{{item.studentName}}<span v-if="item.studentId==mineId">（我）</span></view>
					<view :class="item.result===0?`text-green status`:`text-red status`">{{item.result===0?'已签到':'迟到'}}
					</view>
				</view>
				<u-empty v-else mode="data" text="暂无数据" />
			</view>
			<view v-if="tabsCurrent == 1">
				<u-loading-icon v-if="!memberList" text="加载中" textSize="18"></u-loading-icon>
				<view v-else-if="memberList.length!=0" v-for="(item,index) in memberList" key="index" class="member">
					<u-avatar
						:src="!!item.studentAvatar?BASE_URL + item.studentAvatar:require('@/static/images/profile.jpg')"
						size="50"></u-avatar>
					<view class="name">{{item.studentName}}<span v-if="item.studentId==mineId">（我）</span></view>
					<view class="text-gray status">未签到</view>
				</view>
				<u-empty v-else mode="data" text="暂无数据" />
			</view>


		</view>
	</view>
</template>

<script>
	import wsRequest from '@/utils/websocket'

	import config from '@/config'
	import {
		getCurrentCheckin,
		cancleCheckin
	} from '@/api/checkin/checkin'
	import {
		getRecordAppCheckin,
		getRecordAppCheckinRecord
	} from '@/api/checkin/record'
	import {
		listRecordAppCheckin
	}
	from '@/api/course/record'
	export default {
		data() {
			return {
				mineId: null,
				roleKey: null,
				courseId: null,
				checkinId: null,
				checkInfoNow: null,
				checkinRecord: [],
				deviceInfo: null,
				isCheckIn: false,
				outTimeCheck: false,
				checkinRecordMine: null,
				tabsList: [{
						name: '已签到',
						disabled: false
					},
					{
						name: '未签到',
						disabled: false
					}
				],
				tabsCurrent: 0,
				memberList: [],
				cacheMemberList: [],
				unCacheMemberList: [],
				BASE_URL: null,

			};
		},
		onLoad(option) {
			this.mineId = option.id
			this.roleKey = option.roleKey
			this.courseId = option.courseId
			this.checkinId = option.checkinId
			this.BASE_URL = config.baseUrl
			this.getCheckIn()
			this.getStudent()
			this.getIsCheckin()
			this.getDeviceInfo()
			this.watchSocket();
		},
		destroyed() {
			// this.socket.close()
		},
		onReady() {

		},
		methods: {
			finishCount(){
				console.log('over');
				const time1 = new Date().getTime();
				const time2 = new Date(this.checkInfoNow.endTime).getTime();
				console.log(time1 - time2);
				if (Math.abs(time1 - time2) > 300000) {
					this.checkInfoNow = null
					this.isCheckIn = false
					this.$forceUpdate()
					return
				}
				this.checkInfoNow.timeDiff = 3000000 - (Math.abs(time1 - time2));
				this.outTimeCheck = true;
				if (this.checkInfoNow.timeDiff < 0) {
					this.outTimeCheck = false;
					this.checkInfoNow = null
				}
				
				
			},
			tabsChange(index) {
				this.memberList = []
				this.tabsCurrent = index.index;
			},
			getIsCheckin() {
				getRecordAppCheckinRecord(this.checkinId, this.mineId).then(res => {
					if (!!res.data) {
						this.isCheckIn = true
						this.checkinRecordMine = res.data
					} else {
						this.isCheckIn = false
					}
				})
			},
			getDeviceInfo() {
				const that = this
				uni.getSystemInfo({
					success: function(res) {
						that.deviceInfo = res
					}
				});
			},
			toCheckIn() {
				const that = this
				if(this.roleKey==='student'){
					this.$modal.loading("处理中...")
					getRecordAppCheckin({
						checkinId: this.checkinId,
						courseId: this.courseId,
						studentId: this.mineId,
						teacherId: this.checkInfoNow.teacherId,
						method: this.checkInfoNow.method,
						device: this.deviceInfo.osName + ":" + this.deviceInfo.deviceBrand + ":" + this.deviceInfo
							.deviceModel
					}).then(res => {
						console.log(res);
						this.getIsCheckin()
						this.$modal.msgSuccess(res.msg)
					}).finally(() => {
						this.$modal.closeLoading()
					})
				}else{
					this.$modal.confirm("是否确认提前关闭签到？").then(()=>{
						cancleCheckin({
							courseId:this.courseId
						}).then(res=>{
							this.$modal.msgSuccess(res.msg)
							uni.navigateBack()
						})
					})
				}
				
			},
			getStudent() {
				listRecordAppCheckin({
					courseId: this.courseId
				}).then(res => {
					this.unCacheMemberList = res.data
				})
			},
			watchSocket() {
				wsRequest.getMessage(opt => {
					// console.warn("消息接收：", opt);
					const data = JSON.parse(opt.data)
					switch (data.msgType) {

						case 'checkin_broadcast':
							if (data.courseId == this.courseId) {
								this.cacheMemberList = data.list
								this.memberList = this.unCacheMemberList.filter(member => {
									return !this.cacheMemberList.find(cacheMember => cacheMember
										.studentId === member.studentId);
								});

							}
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
							this.checkInfoNow.timeDiff = 300000 - (Math.abs(time1 - time2));
							this.outTimeCheck = true;
							if (this.checkInfoNow.timeDiff < 0) {
								this.outTimeCheck = false;
								this.checkInfoNow = null
							}


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

	.afterCheckin {
		margin: 35px;

		.device {
			text-align: center;
		}

		.time {
			margin: 5px 0 5px 0;
			font-weight: bold;
			font-size: 20px;
			text-align: center;
		}
	}


	::v-deep .u-button--primary {
		height: 200px !important;
		width: 200px !important;
		border-radius: 100px !important;
		box-shadow: 0px 0px 30px 10px #B3C0F4;

	}

	::v-deep .u-button--success {
		height: 200px !important;
		width: 200px !important;
		border-radius: 100px !important;
		box-shadow: 0px 0px 20px 10px #149d0a;
		font-size: 45px !important;
		color: white !important;
		font-weight: bold !important;
	}

	::v-deep .u-button--warning {
		height: 200px !important;
		width: 200px !important;
		border-radius: 100px !important;
		box-shadow: 0px 0px 20px 10px #f9ae3d;
		font-size: 45px !important;
		color: white !important;
		font-weight: bold !important;
	}

	::v-deep .u-button--error {
		height: 200px !important;
		width: 200px !important;
		border-radius: 100px !important;
		box-shadow: 0px 0px 20px 10px #d9171b;
		font-size: 45px !important;
		color: white !important;
		font-weight: bold !important;
	}

	::v-deep .u-count-down__text {
		font-size: 60px !important;
		color: white !important;
		font-weight: bold !important;
	}

	::v-deep .u-tabs__wrapper__nav__item {
		flex: 1;
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