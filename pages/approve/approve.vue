<template>
	<view>
		<view v-if="approvalList&&approvalList.length!=0" class="approve" v-for="(item,index) in approvalList"
			:key="index">
			<view>请假人：{{item.studentName}}</view>
			<view>请假类型：{{leaveTypeList.find(i=>i.dictValue==item.type).dictLabel}}</view>
			<view>请假原因：{{item.reason}}</view>
			<view>起止时间：{{item.startTime}}-{{item.endTime}}</view>
			<view>总用时：{{item.useTime}}天</view>
			<view v-if="!!item.forwardId">下级审批人：{{item.forwardName}}</view>
			<view class="tool">
				<u-button v-if="item.forwardId!==item.studentId&&!!item.forwardId" type="info" text="移交"
					@click="toNext(item)"></u-button>
				<u-button type="error" text="驳回" @click="toReject(item)"></u-button>
				<u-button type="primary" text="通过" @click="toPass(item)"></u-button>
			</view>

		</view>
		<view v-else>
			<u-empty mode="数据为空" icon="https://cdn.uviewui.com/uview/demo/empty/data.png"></u-empty>
		</view>
		<u-modal :show="commentShow" :title="`请填写审批${approvalName}的原因`" @confirm="toConfirmComment">
			<view>
				<u--input v-model="comment" placeholder="不填默认通过/驳回"></u--input>
			</view>
		</u-modal>
	</view>
</template>

<script>
	import {
		getRecordApp,
		updateRecord
	} from '@/api/approval/record'
	import {
		updateLeave
	} from '@/api/leaveApplication/leave'
	import {
		addInfo
	} from '@/api/notification/info'
	import {
		getDictInfo
	} from '@/api/system/dict'
	import {
		parseTime
	} from '@/utils/ruoyi'
	export default {
		data() {
			return {
				teacherId: null,
				approvalList: [],
				leaveTypeList: [],
				commentShow: false,
				comment: null,
				approvalName: '',
				detail: null,
			};
		},
		onLoad() {
			this.teacherId = this.$store.state.user.user.userId
			this.getDict()
			this.getMyApproval()

		},
		methods: {
			getDict() {
				getDictInfo('class_leave_type').then(res => {
					this.leaveTypeList = res.data
				})
			},
			getMyApproval() {
				getRecordApp({
					approverId: this.teacherId
				}).then(res => {
					this.approvalList = res.data
					this.approvalList.forEach(item => {
						// 定义两个日期（精确到秒）
						var startDate = new Date(item.startTime); // 开始日期
						var endDate = new Date(item.endTime); // 结束日期

						// 将日期转换为时间戳（秒）
						var startTimeStamp = startDate.getTime() / 1000; // 开始日期的时间戳（秒）
						var endTimeStamp = endDate.getTime() / 1000; // 结束日期的时间戳（秒）

						// 计算时间戳之间的差异
						var timeDiff = Math.abs(endTimeStamp - startTimeStamp);

						// 将时间戳差异转换为天数

						item.useTime = (timeDiff / (3600 * 24)).toFixed(1);
					})
				})
			},
			toConfirmComment() {
				if (!this.comment) {
					this.comment = this.approvalName
				}
				this.commentShow = false
				const myDate = parseTime(new Date())
				if (this.detail.forwardId === this.detail.studentId || !this.detail.forwardId) {
					updateLeave({
						id: this.detail.leaveId,
						status: 1
					})
					const recipientId = []
					recipientId.push(this.detail.studentId)

					addInfo({
						recipientId: JSON.stringify(recipientId),
						title: '审批通过通知',
						content: `${this.detail.studentName},你的${this.leaveTypeList.find(i=>i.dictValue==this.detail.type).dictLabel}审批已通过。`,
						type: 0,
						sendTime: myDate,
						priority: 10,
						source: 0
					})
				}
				updateRecord({
					id: this.detail.approvalId,
					status: 1,
					comment: this.comment,
					approvalTime: myDate
				}).then(res => {
					this.getMyApproval()
					this.$modal.msgSuccess(res.msg)
				})
			},
			toPass(item) {
				this.detail = item
				this.approvalName = '通过'
				const text = !!item.forwardId?'确认通过此申请吗！\n下级审批人：' + item.forwardName:'确认通过此申请吗！'
				this.$modal.confirm(text, '请确认', '通过', '考虑一下').then(() => {
					this.commentShow = true;
				}).catch(() => {

				})
			},
			toReject(item) {
				this.detail = item
				this.approvalName = '驳回'
				this.$modal.confirm('确认要驳回此申请吗！', '请确认', '驳回', '考虑一下').then(() => {

					updateRecord({

					}).then(res => {

					})
				}).catch(() => {

				})
			},
			toNext(item) {
				this.detail = item
				this.approvalName = '移交'
				if (item.forwardId === item.studentId || !item.forwardId) {
					this.$modal.msgError('无下级可指派，已无法移交！')
					return
				}
				this.$modal.confirm('确认要移交给下一级吗！', '请确认', '移交', '考虑一下').then(() => {

				}).catch(() => {

				})
			}

		}
	}
</script>

<style lang="scss">
	.approve {
		margin: 8px;
		padding: 8px;
		border: 1px solid #3c96f3;
		border-radius: 8px;

		.tool {
			display: flex !important;
			justify-content: space-between;
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