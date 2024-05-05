<template>
	<view>
		<u-popup :show="chooseAllShow" :round="10" mode="bottom" @close="chooseAllClose" 
			closeable>
			<view class="popup">
				<view class="title">请选择用户（已选{{userChoose.length}}）</view>
				<view class="choose">
					<u-checkbox :customStyle="{padding: '16px'}" v-for="(item,index) in userList" :key="index" activeColor="blue" :label="item.nickName"
						@change="chooseAllChange($event,item)"></u-checkbox>
				</view>
				
			</view>
		</u-popup>
		<u-action-sheet :show="chooseStudentShow" @close="chooseStudentShow = false" :actions="choose"
			@select="selectClick" description="请选择此通知的接收人,将会发送到指定消息下">
		</u-action-sheet>
		<u--form labelPosition="left" :model="form" ref="uForm" labelWidth="120">
			<u-form-item label="通知主题" prop="title" borderBottom>
				<u--input v-model="form.title" border="none" placeholder="填写通知主题"></u--input>
			</u-form-item>
			<u-form-item label="通知内容" prop="content" borderBottom>
				<u--input v-model="form.content" border="none" placeholder="填写通知内容"></u--input>
			</u-form-item>
			<u-form-item label="通知优先级\n(默认为10,1>10)" prop="priority" borderBottom>
				<u--input type="number" v-model="form.priority" border="none" placeholder="越小越靠前" :min="10"
					:max="100"></u--input>
			</u-form-item>
			<u-form-item label="接收此通知的学生" prop="choose" borderBottom @click="chooseAllShow=true">
				<text>{{!!form.recipientId?form.studentListDesp:'请选择接收人'}}</text>
				<u-icon slot="right" name="arrow-right"></u-icon>
			</u-form-item>
		</u--form>
		<u-button type="primary" text="发布新通知" @click="createNotification"></u-button>

	</view>
</template>

<script>
	import {
		listUserApp
	} from '@/api/system/user'
	import {
		addInfo
	} from '@/api/notification/info'
	import {
		parseTime
	} from '@/utils/ruoyi'
	export default {
		onLoad() {
			this.getUsers()
		},
		data() {
			return {
				userChoose: [],
				userList: [],
				chooseAllShow: false,
				chooseStudentShow: false,
				form: {
					priority: 10,
				},
				choose: [{
						name: '所有人',
					},
					{
						name: '所有教师',
					},
					{
						name: '所有学生',
					},
					{
						name: '自定义接收人',
					}

				],

			}
		},
		methods: {
			getUsers() {
				listUserApp().then(res => {
					this.userList = res.data
				})
			},
			selectClick(item) {
				const that = this
				const name = item.name
				this.form.studentListDesp = name
				switch (name) {
					case "所有人":
						this.form.recipientId = JSON.stringify([-1])
						break
					case "所有教师":
						this.form.recipientId = JSON.stringify([-2])
						break
					case "所有学生":
						this.form.recipientId = JSON.stringify([-3])
						break
					case "自定义接收人":
						this.userChoose = true
						break
				}
			},
			chooseAllChange(e, item) {
				if (e) {
					this.userChoose.push(item.userId)
				} else {
					let indexToRemove = this.userChoose.indexOf(item.userId);
					if (indexToRemove !== -1) {
						this.userChoose.splice(indexToRemove, 1);
					}
				}
			},
			chooseAllClose(){
				this.chooseAllShow = false
				this.form.studentListDesp = '已选择'+this.userChoose.length+'人'
				this.form.recipientId = JSON.stringify(this.userChoose)
			},
			createNotification() {
				this.$modal.loading("正在发布中")
				this.form.remark = JSON.stringify({
					sendId: this.$store.state.user.user.userId
				})
				this.form.type = 1
				this.form.source = 1
				this.form.sendTime = parseTime(new Date())
				addInfo(this.form).then(res => {
					this.$modal.msgSuccess("发布成功")
				}).finally(() => {
					this.$modal.closeLoading()
					uni.navigateBack()
				})

			}

		},

	};
</script>
<style scoped lang="scss">
	::v-deep .u-tag--primary--plain {
		width: fit-content;
	}
	.popup{
		
		.choose{
			max-height: 650px;
			overflow-y: scroll;
		}
		
		.title{
			font-size: 24px;
			font-weight: bold;
			margin: 16px 8px ;
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