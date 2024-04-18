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
			<u-form-item label="开始时间" prop="startTime" borderBottom @click="startTimeShow = true; ">
				<text>{{!!form.startTime?form.st:'请选择'}}</text>
				<u-icon slot="right" name="arrow-right"></u-icon>
			</u-form-item>
			<u-form-item label="结束时间" prop="endTime" borderBottom @click="endTimeShow = true; ">
				<text>{{!!form.endTime?form.et:'请选择'}}</text>
				<u-icon slot="right" name="arrow-right"></u-icon>
			</u-form-item>
			<u-form-item v-if="!!form.deptId" label="所属教师" prop="teacherId" borderBottom
				@click="teacherPickerShow = true; ">
				<text>{{!!form.teacherId?form.teacherName:'请选择'}}</text>
				<u-icon slot="right" name="arrow-right"></u-icon>
			</u-form-item>
			<u-form-item label="班级名称" prop="name" borderBottom>
				<u--input v-model="form.name" border="none" placeholder="班级名称"></u--input>
			</u-form-item>
			<u-form-item label="备注" prop="remark" borderBottom>
				<u-textarea v-model="form.remark" count placeholder="备注" height="80" border="none" holdKeyboard
					autoHeight></u-textarea>
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
	export default {
		onLoad() {
			this.user = this.$store.state.user.user
			this.getApprover()
			this.getDict()
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
			setEndTime(e){
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
						this.$modal.confirm('当前没有审批人！请联系管理员！').then(() => {
							uni.navigateBack()
						}).catch(() => {
							uni.navigateBack()
						})
					}

				})
			},
			getDict() {
				getDictInfo('class_leave_type').then(res => {
					this.approveMethodList.push(res.data)
				})
			},
			createApprove() {

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