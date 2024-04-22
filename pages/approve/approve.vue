<template>
	<view>
		<view v-for="(item,index) in approvalList" :key="index">
			{{JSON.parse(item)}}
		</view>
	</view>
</template>

<script>
	import{
		getRecordApp
	}from '@/api/approval/record'
	export default {
		data() {
			return {
				teacherId:null,
				approvalList:[],
			};
		},
		onLoad() {
			this.teacherId = this.$store.state.user.user.userId
			this.getMyApproval()
		},
		methods:{
			getMyApproval(){
				getRecordApp({
					approverId:this.teacherId
				}).then(res=>{
					this.approvalList = res.data
				})
			}
		}
	}
</script>

<style lang="scss">

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
