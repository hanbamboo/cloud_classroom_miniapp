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
				<u-form-item label="持续时间(分钟)" prop="duration" borderBottom @click="checkinTimeShow = true; "
					style="width: 100%;">
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
		<text class="sub-title text-black">我的课程</text>
		<u-grid :border="false" col="2">
			<u-grid-item :custom-style="myStyle" v-if="roleKey!=='student'" @click="toCreateCheckin">发起签到</u-grid-item>
			<u-grid-item :custom-style="myStyle" v-else>课程签到</u-grid-item>
			<u-grid-item :custom-style="myStyle">审批</u-grid-item>
		</u-grid>
	</view>
</template>

<script>
	import config from '@/config'
	import {
		addCheckin
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
		randomUUID
	} from 'crypto'
	export default {
		onLoad: function() {
			console.log(this.$store.state.user);
			this.roleKey = this.$store.state.user.user.roles[0].roleKey

		},
		onReady() {
			this.BASE_URL = config.baseUrl
			this.getDict()
			this.getCourseList()
		},
		data() {
			return {
				roleKey: '',
				BASE_URL: '',
				myStyle: {
					height: '50px',
					width: '45%',
					margin: '5px',
					border: '1px solid #5473E8',
					borderRadius: '8px'
				},
				duration: 5,
				form: {},
				checkinMethodShow: false,
				checkinAddShow: false,
				checkinTimeShow: false,
				courseChooseShow: false,
				checkinMethodActions: [],
				courseChooseList: [],

			}
		},
		methods: {
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
				date.setMinutes(date.getMinutes() + 10)
				this.form.endTime = parseTime(date)
				addCheckin(this.form).then(res => {
					this.$modal.msgSuccess(res.msg)
					this.checkinAddShow = false
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
			}
		}
	}
</script>
<style scoped lang="scss">
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