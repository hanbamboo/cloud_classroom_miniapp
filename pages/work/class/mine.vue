<template>
	<view>
		<view v-for="(item, index) in classList" :key="index">
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
	export default {

		data() {
			return {
				classList: [],
				userId: '',
			}
		},
		methods: {
			getClassList() {
				listRecord({
					teacherId: this.userId
				}).then(res => {
					this.classList = res.data
				})
			}
		},
		onLoad(option) {
			this.userId = option.userId
		},
		onReady() {
			this.getClassList()
		}
	}
</script>

<style scoped lang="scss">
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