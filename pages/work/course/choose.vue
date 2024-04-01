<template>
	<view>
		
	</view>
</template>

<script>
	import {listInfoApp} from '@/api/course/info'
	export default {
		data() {
			return {
				deptId:'',
				roleKey:'',
				courseList:[],
			}
		},
		methods: {
			getCourseList(){
				listInfoApp({
					deptId:this.deptId
				}).then(res=>{
					this.courseList = res.data
				})
			}
		},
		onLoad(option) {
			this.deptId = option.deptId
			this.roleKey = option.roleKey
			this.getCourseList()
		},
	}
</script>

<style>

</style>
