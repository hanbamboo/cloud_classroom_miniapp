<template>
	<view>
		<u-picker :show="deptPickerShow" :columns="deptList" keyName="deptName" @cancel="deptPickerShow=false"
			@confirm="deptPickerConfirm"></u-picker>
		<u-picker :show="teacherPickerShow" :columns="teacherList" keyName="nickName" @cancel="teacherPickerShow=false"
			@confirm="teacherPickerConfirm"></u-picker>
		<u-picker :show="courseTypePickerShow" :columns="courseTypeList" keyName="dictLabel"
			@cancel="courseTypePickerShow=false" @confirm="courseTypePickerConfirm"></u-picker>
		<u-datetime-picker :show="startCourseTimeShow" @cancel="startCourseTimeShow=false"
			@confirm="startCourseTimeConfirm" v-model="form.time" mode="datetime"></u-datetime-picker>
		<u--form labelPosition="left" :model="form" ref="uForm" labelWidth="120">
			<u-form-item label="开课学院" prop="deptId" borderBottom @click="deptPickerShow = true; ">
				<text>{{!!form.deptId?form.deptName:'请选择'}}</text>
				<u-icon slot="right" name="arrow-right"></u-icon>
			</u-form-item>
			<u-form-item v-if="!!form.deptId" label="开课教师" prop="teacherId" borderBottom
				@click="teacherPickerShow = true; ">
				<text>{{!!form.teacherId?form.teacherName:'请选择'}}</text>
				<u-icon slot="right" name="arrow-right"></u-icon>
			</u-form-item>
			<u-form-item label="课程名" prop="name" borderBottom>
				<u--input v-model="form.name" border="none" placeholder="课程名"></u--input>
			</u-form-item>
			<u-form-item label="课程描述" prop="desp" borderBottom>
				<u-textarea v-model="form.desp" count placeholder="课程描述" maxlength="200" height="80" border="none"
					holdKeyboard autoHeight></u-textarea>
			</u-form-item>
			<u-form-item label="课程封面" prop="fileList" borderBottom>
				<u-upload :fileList="fileList" @afterRead="afterRead" @delete="deletePic" @beforeRead="beforeRead"
					:maxCount="1" :previewFullImage="true" accept="image"></u-upload>
			</u-form-item>
			<u-form-item label="课程标签" prop="tags" borderBottom>
				<u--input v-model="form.tags" border="none" placeholder="多个以英文逗号,分隔"></u--input>
			</u-form-item>
			<u-form-item label="课程性质" prop="type" borderBottom @click="courseTypePickerShow = true; ">
				<text>{{!!form.type?form.typeName:'请选择'}}</text>
				<u-icon slot="right" name="arrow-right"></u-icon>
			</u-form-item>
			<u-form-item label="上课时间" prop="time" borderBottom @click="startCourseTimeShow=true">
				<text>{{!!form.time?form.timeFomat:'请选择'}}</text>
				<u-icon slot="right" name="arrow-right"></u-icon>
			</u-form-item>
			<u-form-item label="学生数" prop="capacity" borderBottom>
				<u-number-box integer v-model="form.capacity"></u-number-box>
			</u-form-item>
			<u-form-item label="课程学分" prop="credits" borderBottom>
				<u-number-box step="0.1" decimal-length="1" :min="1" v-model="form.credits"></u-number-box>
			</u-form-item>
			<u-form-item label="课程课时" prop="period" borderBottom>
				<u-number-box integer v-model="form.period"></u-number-box>
			</u-form-item>
			<u-form-item label="备注" prop="remark" borderBottom>
				<u-textarea v-model="form.remark" count placeholder="备注" maxlength="200" height="80" border="none"
					holdKeyboard autoHeight></u-textarea>
			</u-form-item>
		</u--form>
		<u-button type="primary" text="创建新课程" @click="createCourse"></u-button>

	</view>
</template>

<script>
	import {
		listDept,
	}
	from '@/api/dept/dept'
	import {
		addInfo
	}
	from '@/api/course/info'
	import {
		listTeacher
	} from '@/api/system/role'
	import {
		getDictInfo
	} from '@/api/system/dict'
	import {
		parseTime
	} from '@/utils/ruoyi'
	import config from '@/config'
	import {
		getToken
	} from '@/utils/auth'
	import {
		commpnUpload
	} from '@/api/utils'
	export default {
		data() {
			return {
				form: {
					time:new Date()
				},
				deptList: [],
				teacherList: [],
				courseTypeList: [],
				deptPickerShow: false,
				teacherPickerShow: false,
				courseTypePickerShow: false,
				startCourseTimeShow: false,
				fileList: [],
				BASE_URL: config.baseUrl,
			};

		},
		methods: {
			getCourseTypeList() {
				getDictInfo('class_course_type').then(res => {
					this.courseTypeList = []
					this.courseTypeList.push(res.data)
				})
			},
			getDeptListData() {
				listDept().then(res => {
					this.deptList = []
					this.deptList.push(res.data)
				})
			},
			getTeacherListData(deptId) {
				listTeacher({
					deptId: deptId
				}).then(res => {
					this.teacherList = []
					this.teacherList.push(res.data)
				})
			},
			startCourseTimeConfirm(e) {
				this.form.time = e.value
				this.form.timeFomat = parseTime(new Date(e.value))
				this.startCourseTimeShow = false
			},
			teacherPickerConfirm(e) {
				const index = e.indexs[0]
				this.form.teacherId = this.teacherList[0][index].userId
				this.form.teacherName = this.teacherList[0][index].nickName
				this.teacherPickerShow = false
			},
			courseTypePickerConfirm(e) {
				const index = e.indexs[0]
				this.form.type = this.courseTypeList[0][index].dictValue
				this.form.typeName = this.courseTypeList[0][index].dictLabel
				this.courseTypePickerShow = false
			},
			deptPickerConfirm(e) {
				const index = e.indexs[0]
				this.form.deptId = this.deptList[0][index].deptId
				this.form.deptName = this.deptList[0][index].deptName
				this.deptPickerShow = false
				this.getTeacherListData(this.form.deptId)
			},
			createCourse() {
				if (!this.form.teacherId) {
					this.form.teacherId = this.$store.state.user.user.userId
				}
				addInfo(this.form).then(res => {
					this.$modal.msgSuccess(res.msg)
					this.$tab.navigateBack()
				}).finally(() => {
					that.$modal.closeLoading()
				})

			},
			deletePic(event) {
				this.fileList.splice(event.index, 1)
				this.form.cover = ''
			},
			async beforeRead() {
			},
			async afterRead(event) {
				this.$modal.loading('加载图片中')
				this.fileList = []
				try {
					const fileUrl = event.file.url
					const result = await this.uploadFilePromise(fileUrl)
					this.form.cover = result.fileName
					this.fileList.push(result)
					this.$modal.closeLoading()
				} catch {
					this.$modal.closeLoading()
				}
				
			},
			uploadFilePromise(url) {
				return new Promise((resolve, reject) => {
					let a = uni.uploadFile({
						url: this.BASE_URL + '/common/upload', // 仅为示例，非真实的接口地址
						filePath: url,
						name: 'file',
						header: {
							Authorization: 'Bearer ' + getToken()
						},
						success: (res) => {
							setTimeout(() => {
								resolve(JSON.parse(res.data))
							}, 1000)
						}
					});
				})
			},

		},
		onReady() {
			this.getDeptListData()
			this.getCourseTypeList()

		},
		afterRead() {

		},
		deletePic() {

		},

	};
</script>
<style>
	page {
		background: #ffffff;
		width: 95%;
		margin: 10px;
	}
</style>