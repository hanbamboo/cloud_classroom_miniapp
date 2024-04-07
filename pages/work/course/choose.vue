<template>
	<view class="list">
		<view v-for="(item, index) in courseList" :key="index">
			<view class="course">
				<image :src="BASE_URL+item.cover"></image>
				<view class="name">{{item.name}}</view>
				<view>{{filterDict(item.type,courseType)[0].dictLabel}}</view>

				<view>{{item.deptName}}</view>
				<view>{{item.desp}}</view>
				<view>{{item.teacherName}}</view>
				<view>{{item.selected}}/{{item.capacity}}</view>
				<view>{{item.period}}</view>
				<view>{{item.tags}}</view>
				<view>{{item.status}}</view>
				<view>{{item.time}}</view>
				<view>
					<text>学分</text>
					<text>{{item.credits}}</text>
				</view>
				<u-button v-if="item.exists === 'yes'" type="error" plain text="去除此课程"
					@click="noChooseCourse(item)"></u-button>
				<u-button v-else type="primary" text="选择此课程" @click="chooseCourse(item)"></u-button>
				<u-button type="primary" text="查看已选学生"></u-button>

			</view>
		</view>
		<view class="over-credits">
			<view class="choose-show">{{totalCredits}}已选学分</view>
			<!-- <u-button type="primary" text="保存课程选择" @click="confirmChoose"></u-button> -->
		</view>

	</view>
</template>

<script>
	import config from '@/config'
	import {
		listInfoApp
	} from '@/api/course/info'
	import {
		getDictInfo
	} from '@/api/system/dict'
	import {
		addRecordBatch,
		courseNumStatus
	} from '@/api/course/record'
	export default {
		data() {
			return {
				mineId: '',
				deptId: '',
				roleKey: '',
				BASE_URL: '',
				typeName: '',
				courseList: [],
				courseType: [],
				totalCredits: 0,

			}
		},
		methods: {
			getCourseList() {
				listInfoApp({
					deptId: this.deptId,
					studentId: this.mineId
				}).then(res => {
					this.courseList = res.data
					this.totalCredits = 0
					this.courseList.forEach(item => {
						if (item.exists === 'yes') {
							this.totalCredits += item.credits
						}
					})
				})
			},
			filterDict(value, dict) {
				return dict.filter(item => item.dictValue == value)
			},
			getDict() {
				getDictInfo('class_course_type').then(res => {
					this.courseType = res.data
				})
			},
			chooseCourse(item) {
				this.$modal.loading('加载中...')
				courseNumStatus({
					studentId: this.mineId,
					courseId: item.id,
					capacity: item.capacity
				}).then(res => {
					const data = res.data
					item.selected = data.selectNum
					item.exists = data.exists
					if (data.selectNum >= item.capacity) {
						this.$modal.showToast('该课程已选满')
					} else {
						this.totalCredits = this.totalCredits + item.credits
						this.$modal.showToast(item.name + '选课成功！')
					}
				}).finally(() => {
					this.$modal.closeLoading()
				})

			},
			noChooseCourse(item) {
				this.$modal.loading('加载中...')
				courseNumStatus({
					studentId: this.mineId,
					courseId: item.id,
					capacity: item.capacity
				}).then(res => {
					const data = res.data
					item.selected = data.selectNum
					item.exists = data.exists
					this.totalCredits = this.totalCredits - item.credits
				}).finally(() => {
					this.$modal.closeLoading()
				})

			},

		},
		onLoad(option) {
			this.mineId = option.id
			this.deptId = option.deptId
			this.roleKey = option.roleKey
			this.getCourseList()
			this.getDict()
		},
		onReady() {
			this.BASE_URL = config.baseUrl

		}
	}
</script>

<style scoped lang="scss">
	.over-credits {
		display: flex;
		width: 100%;
		height: 100px;
		position: fixed;
		background: #fff;
		bottom: 0px;
		padding: 8px;

		.choose-show {
			width: 80% !important;
			font-weight: bold;
			font-size: 20px;
		}

	}

	.list {
		margin-bottom: 100px;
	}

	.course {
		border: 1px solid #ccc;
		border-radius: 8px;
		position: relative;
		margin-bottom: 8px;

		.name {
			font-weight: bold;
			position: absolute;
			font-size: 22px;
			left: 130px;
			top: 3px;
		}
	}
</style>
<style>
	image {
		border-radius: 8px;
		width: 120px;
		height: 80px;
		margin: 3px;
	}

	page {
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		background: #fff !important;
		padding: 16px;
	}
</style>