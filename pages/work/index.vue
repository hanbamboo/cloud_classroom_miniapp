<template>
	<view class="work-container">
		<!-- 轮播图 -->
		<u-swiper keyName="image" showTitle :list="data" indicator indicatorMode="line" circular>

		</u-swiper>
		<uni-section title="班级管理" type="line"></uni-section>
		<u-grid col="3">
			<u-grid-item @click="toCreateClass">
				<u-icon name="plus" size="22"></u-icon>
				<text class="grid-text">创建班级</text>
			</u-grid-item>
			<u-grid-item>
				<u-icon name="man-add" size="22"></u-icon>
				<text class="grid-text">加入班级</text>
			</u-grid-item>
			<u-grid-item @click="toMyClass">
				<u-icon name="list-dot" size="22"></u-icon>
				<text class="grid-text">我的班级</text>
			</u-grid-item>
		</u-grid>
		<uni-section title="课堂管理" type="line"></uni-section>
		<u-grid col="3">
			<u-grid-item @click="toCreateCourse">
				<u-icon name="plus" size="22"></u-icon>
				<text class="grid-text">创建课程</text>
			</u-grid-item>
			<u-grid-item>
				<u-icon name="plus" size="22"></u-icon>
				<text class="grid-text">我的课程</text>
			</u-grid-item>
			<u-grid-item>
				<u-icon name="man-add" size="22"></u-icon>
				<text class="grid-text">发布通知</text>
			</u-grid-item>

			<u-grid-item>
				<u-icon name="list-dot" size="22"></u-icon>
				<text class="grid-text">发布签到</text>

			</u-grid-item>

		</u-grid>
		<uni-section title="数据管理" type="line"></uni-section>
		<u-grid col="3">
			<u-grid-item>
				<u-icon name="plus" size="22"></u-icon>
				<text class="grid-text">我的审批</text>
			</u-grid-item>
			<u-grid-item>
				<u-icon name="man-add" size="22"></u-icon>
				<text class="grid-text">历史通知</text>
			</u-grid-item>
			<u-grid-item>
				<u-icon name="list-dot" size="22"></u-icon>
				<text class="grid-text">审批记录</text>
			</u-grid-item>
			<u-grid-item>
				<u-icon name="list-dot" size="22"></u-icon>
				<text class="grid-text">签到历史</text>
			</u-grid-item>
		</u-grid>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				myCustomStyle: {
					width: '220rpx',
					height: '220rpx'
				},
				current: 0,
				swiperDotIndex: 0,
				data: [{
						title: 'aaa',
						image: '/static/images/banner/banner01.jpg'
					},
					{
						title: 'bbb',
						image: '/static/images/banner/banner02.jpg'
					},
					{
						title: 'ccc',
						image: '/static/images/banner/banner03.jpg'
					}
				]
			}
		},
		methods: {
			clickBannerItem(item) {
				console.info(item)
			},
			changeSwiper(e) {
				this.current = e.detail.current
			},
			changeGrid(e) {
				this.$modal.showToast('模块建设中~')
			},
			toCreateClass() {
				this.$tab.navigateTo(`/pages/work/class/index`)
			},
			toMyClass() {
				this.$tab.navigateToWithParams(`/pages/work/class/mine`, {
					userId: this.$store.state.user.user.userId
				})
			},
			toCreateCourse() {
				this.$tab.navigateTo(`/pages/work/course/index`)
			},
		}
	}
</script>
<style lang="scss">
	/* #ifndef APP-NVUE */
	page {
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		background-color: #fff;
		min-height: 100%;
		height: auto;
	}

	view {
		font-size: 14px;
		line-height: inherit;
	}

	/* #endif */

	.text {
		text-align: center;
		font-size: 26rpx;
		margin-top: 10rpx;
	}

	.grid-text {
		font-size: 14px;
		color: #909399;
		padding: 10rpx 0 20rpx 0rpx;
		/* #ifndef APP-PLUS */
		box-sizing: border-box;
		/* #endif */
	}


	.uni-margin-wrap {
		width: 690rpx;
		width: 100%;
		;
	}

	.swiper {
		height: 300rpx;
	}

	.swiper-box {
		height: 150px;
	}

	.swiper-item {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: column;
		justify-content: center;
		align-items: center;
		color: #fff;
		height: 300rpx;
		line-height: 300rpx;
	}

	@media screen and (min-width: 500px) {
		.uni-swiper-dot-box {
			width: 400px;
			/* #ifndef APP-NVUE */
			margin: 0 auto;
			/* #endif */
			margin-top: 8px;
		}

		.image {
			width: 100%;
		}
	}
</style>