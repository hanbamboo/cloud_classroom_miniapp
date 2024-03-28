<template>
	<view class="container">
		<u-cell-group>
			<u-cell size="large" icon="setting-fill" title="个人信息" :customStyle="'background:#F3F4F6;'"></u-cell>
			<u-cell size="large" title="头像" label="对外展示头像" isLink @click="handleToAvatar"></u-cell>
			<u-cell size="large" title="姓名" :value="user.nickName" label="对外展示姓名"></u-cell>
			<u-cell size="large" title="性别" :value="userSex.dictLabel" label="用户性别"></u-cell>
			<u-cell size="large" title="手机号" :value="user.phonenumber" label="消息下发与传达" isLink
				@click="formShow = true"></u-cell>
			<u-cell size="large" title="邮箱" :value="user.email" label="消息下发与传达" isLink
				@click="formShow = true"></u-cell>
			<u-cell size="large" icon="home-fill" title="课堂数据" :customStyle="'background:#F3F4F6;'"></u-cell>
			<u-cell size="large" title="所在学院" :value="user.dept.deptName" label="用户所属学院"></u-cell>
			<u-cell size="large" title="用户职责" :value="user.roles[0].roleName" label="用户持有职能"></u-cell>
			<u-cell size="large" title="归属班级" :value="classInfo.length>0?'查看':'暂未加入任何班级'" label="用户管理班级"
				:isLink="classInfo.length"></u-cell>
			<u-cell size="large" title="教学类别" :value="postGroup" label="用户教学分类"></u-cell>
		</u-cell-group>
		<u-modal :show="formShow" title="修改用户信息" @confirm="changeInfo" :asyncClose="true" showCancelButton
			@cancel="formShow=false">
			<view class="slot-content">
				<u--form labelPosition="left" :model="form">
					<u-form-item label="手机号" prop="phonenumber" borderBottom labelWidth="80">
						<u--input v-model="form.phonenumber" border="none"></u--input>
					</u-form-item>
					<u-form-item label="邮箱" prop="email" borderBottom labelWidth="80">
						<u--input v-model="form.email" border="none"></u--input>
					</u-form-item>
				</u--form>
			</view>
		</u-modal>
	</view>
</template>

<script>
	import {
		getUserProfile,
		updateUserProfile
	} from "@/api/system/user"

	import {
		getDictInfo
	} from "@/api/system/dict"
	export default {
		data() {
			return {
				user: {},
				roleGroup: "",
				postGroup: "",
				classInfo: [],
				userSex: {},
				form: {},
				formShow: false,

			}
		},
		onLoad() {
			this.getUser()
		},
		methods: {
			getUser() {
				getUserProfile().then(response => {
					this.user = response.data
					this.form = {
						phonenumber: this.user.phonenumber,
						email: this.user.email
					}
					this.user.phonenumber = !this.user.phonenumber ? '未填写' : this.user.phonenumber
					this.user.email = !this.user.email ? '未填写' : this.user.email
					this.roleGroup = response.roleGroup
					this.postGroup = response.postGroup
					this.classInfo = response.class

				}).then(() => {
					getDictInfo('sys_user_sex').then((res) => {
						const sexList = res.data
						this.userSex = sexList.find(dict => dict.dictValue == this.user.sex);
					})
				})
			},
			changeInfo() {
				updateUserProfile(this.form).then(res => {
					this.$modal.showToast(res.msg)
					this.getUser()
				}).finally(() => {
					this.formShow = false
				})
			},
			handleToAvatar() {
				this.$tab.navigateTo('/pages/mine/avatar/index')
			},
		}
	}
</script>

<style lang="scss">
	page {
		background-color: #ffffff;
	}
</style>