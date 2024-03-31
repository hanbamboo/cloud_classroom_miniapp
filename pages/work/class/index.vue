<template>
	<view>
		<u-picker :show="deptPickerShow" :columns="deptList" keyName="deptName" @cancel="deptPickerShow=false"
			@confirm="deptPickerConfirm"></u-picker>
			<u-picker :show="teacherPickerShow" :columns="teacherList" keyName="nickName" @cancel="teacherPickerShow=false"
				@confirm="teacherPickerConfirm"></u-picker>
		<u--form labelPosition="left" :model="form" ref="uForm" labelWidth="120">
			<u-form-item label="所属学院" prop="deptId" borderBottom @click="deptPickerShow = true; ">
				<text>{{!!form.deptId?form.deptName:'请选择'}}</text>
				<u-icon slot="right" name="arrow-right"></u-icon>
			</u-form-item>
			<u-form-item v-if="!!form.deptId" label="所属教师" prop="teacherId" borderBottom @click="teacherPickerShow = true; " >
				<text>{{!!form.teacherId?form.teacherName:'请选择'}}</text>
				<u-icon slot="right" name="arrow-right"></u-icon>
			</u-form-item>
			<u-form-item label="班级名称" prop="name" borderBottom>
				<u--input v-model="form.name" border="none"  placeholder="班级名称"></u--input>
			</u-form-item>
			<u-form-item label="备注" prop="remark" borderBottom>
				<u-textarea v-model="form.remark"  count placeholder="备注" height="80" border="none" holdKeyboard autoHeight ></u-textarea>
			</u-form-item>
		</u--form>
		<u-button type="primary" text="创建" @click="createClass"></u-button>

	</view>
</template>

<script>
	import {
		listDept,
	}
	from '@/api/dept/dept'
	import{
		addRecord
	}
	from '@/api/class/record'
	import { listTeacher } from '@/api/system/role'
	export default {
		data() {
			return {
				form: {

				},
				deptList: [],
				teacherList: [],
				deptPickerShow: false,
				teacherPickerShow: false,
			};

		},
		methods: {
			getDeptListData() {
				listDept().then(res => {
					this.deptList = []
					this.deptList.push(res.data)
				})
			},
			getTeacherListData(deptId){
				listTeacher({
					deptId:deptId
				}).then(res=>{
					this.teacherList = []
					this.teacherList.push(res.data)
				})
			},
			teacherPickerConfirm(e) {
				const index =  e.indexs[0]
				this.form.teacherId = this.teacherList[0][index].userId
				this.form.teacherName = this.teacherList[0][index].nickName
				this.teacherPickerShow = false
			},
			deptPickerConfirm(e) {
				const index = e.indexs[0]
				this.form.deptId = this.deptList[0][index].deptId
				this.form.deptName = this.deptList[0][index].deptName
				this.deptPickerShow = false
				this.getTeacherListData(this.form.deptId)
			},
			createClass(){
				if(!this.form.name){
					this.$modal.msgError('未填写班级名')
					return
				}
				if(!this.form.deptId){
					this.$modal.msgError('未选择学院')
					return
				}
				const that = this
				this.$modal.loading('正在创建新班级')
				if(!this.form.remark){
					this.form.remark = '无'
				}
				if(!this.form.teacherId){
					this.form.teacherId = this.$store.state.user.user.userId
				}
				addRecord(this.form).then(res=>{
					this.$modal.msgSuccess(res.msg)
					this.$tab.navigateBack()
				}).finally(()=>{
					that.$modal.closeLoading()
				})
				
			}

		},
		onReady() {
			this.getDeptListData()
		
		},
	};
</script>
<style >
	page {
		background:#ffffff;
		width: 95%;
		    margin: 10px;
	}
</style>