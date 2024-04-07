<template>
	<view>
		<u-action-sheet :show="actionShow" title="查看班级下的学生" @close="actionShow = false">
			<view v-if="studentList.length>0" class="student-wrapper">
				<view v-for="(item, index) in studentList" :key="index">
					<view class="student">
						<u-avatar :src="BASE_URL+item.avatar"></u-avatar>
						<text class="name text-blue">{{item.nickName}}</text>
						<view class="dept">{{item.dept.deptName}}</view>


					</view>

				</view>

			</view>
			<view v-else>
				<u-empty text="该班级无学生" />
			</view>
			<view class="action-button">
				<u-button type="primary" text="添加新学生"></u-button>
			</view>
			
		</u-action-sheet>

		<view v-for="(item, index) in classList" :key="index" @click.stop="operation(item)">
			<view class="class">
				<view class="name text-blue">{{item.name}}</view>
				<view class="dept">{{item.deptName}}</view>
				<view class="count">
					<text class="title">学生数</text>
					<text class="number text-blue">{{item.studentCount}}</text>
				</view>

			</view>
		</view>
	</view>
</template>


<script>
	import {
		listRecord
	} from '@/api/class/record'
	import {
		listUserApp
	} from '@/api/system/user'
	import config from '@/config'
	export default {

		data() {
			return {
				classList: [],
				studentList: [],
				userId: '',
				actionShow: false,
				BASE_URL: '',

			}
		},
		methods: {
			getClassList() {
				listRecord({
					teacherId: this.userId
				}).then(res => {
					this.classList = res.data
				})
			},
			operation(item) {
				this.actionShow = true
				listUserApp({
					classId: item.id
				}).then(res => {
					this.studentList = res.data
				})
			}
		},
		onLoad(option) {
			this.userId = option.userId
			this.BASE_URL = config.baseUrl
		},
		onReady() {
			this.getClassList()
		}
	}
</script>

<style scoped lang="scss">
	.action-button{
		margin: 5px 20px 10px 20px;
	}
	
	.student-wrapper {
		padding: 8px;
	}

	.student {
		display: flex;
		padding: 8px;
		border-radius: 8px;
		border: 1px solid #5473E8;
		position: relative;
		margin: 0 0 8px 0;

		.name {
			margin: 5px;
			font-weight: 700;
			font-size: 24px;
		}

		.dept {
			align-self: center;
			right: 20px;
			position: absolute;
		}
	}

	.class {
		padding: 8px;
		border-radius: 8px;
		border: 1px solid #5473E8;
		position: relative;
		margin: 0 0 8px 0;

		.name {
			margin: 5px 0 5px 0;
			font-weight: 700;
			font-size: 24px;
		}

		.count {
			position: absolute !important;
			right: 20px;
			top: 0;
			height: 100%;
			display: flex;
			flex-direction: column;
			justify-content: center;

			.title {
				color: #000;
				font-size: 16px;
			}

			.number {

				width: 100%;
				text-align: center;
				font-weight: 700;

				font-size: 24px;
			}
		}

	}
</style>
<style>
	page {
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		background: #fff !important;
		padding: 16px;
	}
</style>