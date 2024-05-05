<template>
	<view>
		<u-picker :show="approvePickerShow" :columns="approveMethodList" keyName="dictLabel"
			@cancel="approvePickerShow=false" @confirm="approvePickerConfirm"></u-picker>
		<u-datetime-picker :show="startTimeShow" v-model="form.startTime" mode="datetime" @confirm="setStartTime"
			@cancel="startTimeShow = false"></u-datetime-picker>
		<u-datetime-picker :show="endTimeShow" v-model="form.endTime" mode="datetime" @confirm="setEndTime"
			@cancel="endTimeShow = false"></u-datetime-picker>
		<u--form labelPosition="left" :model="form" ref="uForm" labelWidth="120">
			<u-form-item label="请假类型" prop="deptId" borderBottom @click="approvePickerShow = true; ">
				<text>{{!!form.type?form.typeName:'请选择'}}</text>
				<u-icon slot="right" name="arrow-right"></u-icon>
			</u-form-item>
			<u-form-item label="开始时间" prop="startTime" borderBottom @click="startTimeShow = true;">
				<text>{{!!form.startTime?form.st:'请选择'}}</text>
				<u-icon slot="right" name="arrow-right"></u-icon>
			</u-form-item>
			<u-form-item label="结束时间" prop="endTime" borderBottom @click="endTimeShow = true;">
				<text>{{!!form.endTime?form.et:'请选择'}}</text>
				<u-icon slot="right" name="arrow-right"></u-icon>
			</u-form-item>
			<u-form-item label="请假事由" prop="name" borderBottom>
				<u--input v-model="form.reason" border="none" placeholder="填写请假事由"></u--input>
			</u-form-item>
			<u-form-item label="辅导员审批" borderBottom>
				<u-tag size="mini" :text="classInfo.teacherName" plain></u-tag>
			</u-form-item>
			<u-form-item prop="remark" borderBottom v-for="(itme,index) in approverList" :label="`审批人${index + 1}`"
				:key="index">
				<u-tag size="mini" :text="itme.approverName" plain></u-tag>
			</u-form-item>
			<u-form-item label="抄送" borderBottom>
				<u-tag size="mini" :text="user.nickName" plain></u-tag>
			</u-form-item>
		</u--form>
		<u-button type="primary" text="提交新审批" @click="createApprove"></u-button>

	</view>
</template>

<script>
	import {
		getDictInfo
	} from '@/api/system/dict'
	import {
		listApprover
	} from '@/api/approval/approver'
	import {
		getRecord
	} from '@/api/class/record'
	import {
		addLeave
	} from '@/api/leaveApplication/leave'
	export default {
		onLoad() {
			this.user = this.$store.state.user.user
			this.getApprover()
			this.getDict()
			this.getClass()
		},
		data() {
			return {
				user: null,
				approvePickerShow: false,
				startTimeShow: false,
				endTimeShow: false,
				approveMethodList: [],
				approverList: [],
				form: {},
				classInfo: {},


			}
		},
		methods: {
			result(time, mode) {
				const timeFormat = uni.$u.timeFormat,
					toast = uni.$u.toast
				switch (mode) {
					case 'datetime':
						return timeFormat(time, 'yyyy-mm-dd hh:MM:ss')
					case 'date':
						return timeFormat(time, 'yyyy-mm-dd')
					case 'year-month':
						return timeFormat(time, 'yyyy-mm')
					case 'time':
						return time
					default:
						return ''
				}
			},
			setStartTime(e) {
				this.form.startTime = e.value
				this.form.st = this.result(e.value, e.mode)
				this.startTimeShow = false;
			},
			setEndTime(e) {
				this.form.endTime = e.value
				this.form.et = this.result(e.value, e.mode)
				this.endTimeShow = false;
			},
			getApprover() {
				listApprover({
					pageSize: 100,
					deptId: this.user.deptId
				}).then(res => {
					if (!!res.data || !!res.rows) {
						this.approverList = res.data || res.rows
					} else {
						// this.$modal.confirm('当前没有审批人！请联系管理员！').then(() => {
						// 	uni.navigateBack()
						// }).catch(() => {
						// 	uni.navigateBack()
						// })
					}
				})
			},
			getClass() {
				const classId = this.$store.state.user.user.classId
				if (!classId) {
					this.$modal.confirm('当前未加入任何班级！请先加入班级！').then(() => {
						uni.navigateBack()
					}).catch(() => {
						uni.navigateBack()
					})
					return
				}
				getRecord(classId).then(res => {
					this.classInfo = res.data
				})
			},
			getDict() {
				getDictInfo('class_leave_type').then(res => {
					this.approveMethodList.push(res.data)
				})
			},
			createApprove() {
				this.$modal.loading("提交中")
				this.form.studentId = this.$store.state.user.user.userId
				this.form.approverId = this.classInfo.teacherId
				let approver = []
				this.approverList.forEach(item => {
					approver.push({
						"id": item.approverId
					})
				})
				approver.unshift({
					"id": this.form.approverId
				})
				approver.push({
					"id": this.form.studentId
				})
				this.form.approver = approver
				addLeave(this.form).then(res => {
					this.$modal.msgSuccess(res.msg)
				}).finally(() => {
					this.$modal.closeLoading()
					uni.navigateBack()
				})
			},
			approvePickerConfirm(e) {
				const index = e.indexs[0]
				this.form.type = this.approveMethodList[0][index].dictValue
				this.form.typeName = this.approveMethodList[0][index].dictLabel
				this.approvePickerShow = false
			}

		},

	};
</script>
<style scoped>
	::v-deep .u-tag--primary--plain {
		width: fit-content;
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