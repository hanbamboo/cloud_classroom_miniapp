<template>
	<view>
		<view class="item" v-for="(item,index) in notifications" :key="index">
			<view class="type">{{classNotificationType.find(i=>i.dictValue == item.type).dictLabel}}</view>
			<view :class="!!item.isRead?`title text-grey`:`title text-black`">{{item.title}}</view>
			<view class="time text-grey">{{item.sendTime}}</view>
			<span class="btn" @click="toReadNotification(item)">查看信息</span>
			
			
		<!-- 	<view>{{classNotificationType.find(i=>i.dictValue == item.type).dictLabel}}</view>
			<view>{{item.title}}</view>
			<view>{{item.content}}</view>
			<view>{{classNotificationSource.find(i=>i.dictValue == item.source).dictLabel}}</view>
			<view>{{item.sendTime}}</view>
			<view>{{!!item.isRead?'已读':'未读'}}</view>
			<view>已读/未读人次：{{item.hasRead}}/{{item.totalRead}}</view>
			<span @click="toReadNotification">查看信息</span> -->
		</view>
	</view>
</template>

<script>
	import {
		listAll,
		getNotificationNum
	}from '@/api/notification/info'
	import{
		getDictInfo
	}from '@/api/system/dict'
	export default {
		data() {
			return {
				notifications:[],
				classNotificationType:[],
				classNotificationSource:[],
			};
		},
		// onLoad() {
		// 	this.getMyNotification()
		// 	this.getDict()
		// },
		onShow() {
			this.getMyNotification()
			this.getNotification()
			this.getDict()
		},
		methods:{
			getNotification() {
				getNotificationNum({
					recipientId: this.$store.state.user.user.userId
				}).then(res => {
					if (!!res.data && res.data !== 0) {
						uni.setTabBarBadge({
							index: 2,
							text: res.data + ""
						})
					}else{
						uni.removeTabBarBadge({
							index:2
						})
					}
				})
			},
			getMyNotification(){
				listAll({
					recipientId:this.$store.state.user.user.userId
				}).then(res=>{
					this.notifications = res.data
				})
			},
			getDict(){
				getDictInfo('class_notification_type').then(res=>{
					this.classNotificationType = res.data
				})
				getDictInfo('class_notification_source').then(res=>{
					this.classNotificationSource = res.data
				})
			},
			toReadNotification(item){
				this.$tab.navigateToWithParams(`/pages/notification/record`,{
					id:item.id
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.item{
		margin: 8px;
		border: 1px solid #5473E8;
		border-radius: 8px;
		position: relative;
		.type{
			color:#fff;
			background:#5473E8;
			border-radius: 8px 8px 0 0 ;
			border:1px solid #5473E8;
			padding: 5px;
		}
		.title{
			font-weight: bold;
			font-size: 20px;
			padding: 5px;
		}
		.time{
			padding: 5px;
		}
		.btn{
			padding: 5px 10px;
			background: #5473E8;
			color: #fff;
			border-radius: 8px;
			position: absolute;
			right: 0;
			top:68%;
			transform: translate(-20%,-50%);
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