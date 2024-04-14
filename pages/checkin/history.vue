<template>
	<view>
		<view class="box" v-for="(item,index) in historyList" key="index">
			<view class="head">
				<view class="name">{{item.courseName}}</view>
				<view class="method"> <u-tag :text="getMethod(item.method).dictLabel" plain /></view>
			</view>
			
			
			<view class="normal">签到率：{{item.checkinRateNormal}}</view>
			<view class="out">迟到率：{{item.checkinRateOut}}</view>
			<view class="out">开始时间：{{item.startTime}}</view>
		</view>
	</view>
</template>

<script>
	import {
		getDictInfo
	} from '@/api/system/dict'
	import {
		listCheckinApp
	} from '@/api/checkin/checkin'
	export default {
		onLoad(option) {
			this.teacherId = option.teacherId
			this.getCheckinHistory()
			this.getDict()
		},
		data() {
			return {
				teacherId:null,
				historyList:[],
				methodList:[],
			}
		},
		methods: {
			getCheckinHistory(){
				listCheckinApp({
					teacherId:this.teacherId
				}).then(res=>{
					this.historyList = res.data
				})
			},
			getDict(){
				getDictInfo('class_checkin_type').then(res => {
					this.methodList = res.data
				})
			},
			getMethod(value){
				return this.methodList.find(item=>item.dictValue == value)
			}
			
		}
	}
</script>
<style scoped lang="scss">
	.box{
		margin: 8px;
		border: 1px solid #3c96f3;
		border-radius: 8px;
		position: relative;
		padding: 8px;
		
		.head{
			display: flex;
			.name{
				font-weight:bold;
				font-size:20px;
				margin:0 8px 0 0;
			}
		}
	}
</style>
<style>
	page {
		padding: 8px;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		background-color: #fff;
		min-height: 100%;
		height: auto;
	}
</style>
