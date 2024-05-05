<template>
	<view>
		<view class="item">
			<view class="type">{{notification.typeName}}</view>
			<view class="title">{{notification.title}}</view>
			<view class="content">{{notification.content}}</view>
			<view class="time text-grey">{{notification.sendTime}}</view>
			<!-- <view>{{!!notification.isRead?'已读':'未读'}}</view> -->
			<view class="read text-grey">{{notification.hasRead}}人已读</view>
			<view class="source text-grey2">---{{notification.sourceName}}---
			</view>
		</view>
	</view>
</template>

<script>
	import {
		getInfo
	} from '@/api/notification/info'
	import {
		addRecord
	} from '@/api/notification/record'
	import {
		getDictInfo
	} from '@/api/system/dict'
	export default {
		data() {
			return {
				notification: null,
				classNotificationType: [],
				classNotificationSource: [],
			};
		},
		onLoad(option) {
			this.getMyNotification(option.id)
			this.getDict()
		},
		methods: {
			getMyNotification(id) {
				const that = this
				getInfo(id).then(res => {
					this.notification = res.data
					this.notification.typeName = this.classNotificationType.find(i=>i.dictValue == this.notification.type).dictLabel
					this.notification.sourceName = this.classNotificationSource.find(i=>i.dictValue == this.notification.source).dictLabel
					if (this.notification.isRead==0) {
						addRecord({
							notificationId: id,
							userId: this.$store.state.user.user.userId,
						}).then(res => {
							that.getMyNotification(id)
						})
					}
				})
			},
			getDict() {
				getDictInfo('class_notification_type').then(res => {
					this.classNotificationType = res.data
				})
				getDictInfo('class_notification_source').then(res => {
					this.classNotificationSource = res.data
				})
			},

		}
	}
</script>

<style lang="scss" scoped>
	.item {
		margin: 16px;
		padding: 8px;
		background: #fbfbfb;
		border-radius: 8px;

		.type {
			color: #fff;
			background: #5473E8;
			border-radius: 8px 8px 0 0;
			border: 1px solid #5473E8;
			padding: 5px;
		}

		.title {
			font-weight: bold;
			font-size: 26px;
			padding: 5px;
		}

		.time,
		.read {
			width: 100%;
			text-align: right;
			padding: 5px;
		}

		.content {
			background: #5473e80d;
			border-radius: 8px;
			margin: 16px;
			padding: 8px;
		}

		.read {
			margin: 0 0 10px 0;
		}
		.source{
			text-align: center;
			margin: 0 0 16px 0;
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