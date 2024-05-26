<template>
	<view>
		<u-popup :show="checkShow" :round="10" mode="bottom" @close="checkShow=false" @open="checkOpen" closeable>
			<view class="popup">
				<view class="type text-black">{{recordData.approverName}}的{{recordData.typeName}}
					<span class="usetime text-grey2">(用时{{recordData.useTime}}天)</span>
				</view>
				<view class="reason text-gray1">{{recordData.reason}}</view>
        <view v-if="!!recordData.imgList">附件：
          <u-upload :fileList="recordData.imgList" disabled></u-upload>
        </view>
				<view class="time text-grey2">{{recordData.startTime}}~{{recordData.endTime}}</view>
				<view class="container">
					<u-steps :current="recordData.currentDot" direction="column" activeIcon="checkmark"
						inactiveIcon="arrow-right">
						<u-steps-item v-for="(item,index) in recordData.details" :key="index"
							:title="(recordData.approverId==item.approverId?'抄送：':'审批：')+item.approverName+(recordData.currentDot>=index?'（'+item.approvalTime+' '+recordData.statusName+'） ':((item.finalStatus!=0&&item.finalStatus!=1&&item.finalStatus!=4)?'（流程终止）' :(recordData.currentDot<index&index-1==recordData.currentDot?'（审批中）':'（未开始）')))"
							:desc="!!item.comment?'审批意见：'+item.comment:''">
							{{item.approverId}}</u-steps-item>
					</u-steps>
				</view>
			</view>
		</u-popup>
		<view v-if="approvalList&&approvalList.length!=0" class="approve" v-for="(item,index) in approvalList"
			:key="index">
			<view>请假人：{{item.studentName}}</view>
			<view>请假类型：{{leaveTypeList.find(i=>i.dictValue==item.type).dictLabel}}</view>
			<view>请假原因：{{item.reason}}</view>
			<view v-if="!!item.imgList">附件：
        <u-upload :fileList="item.imgList" disabled></u-upload>
      </view>
			<view>起止时间：{{item.startTime}}-{{item.endTime}}</view>
			<view>总用时：{{item.useTime}}天</view>
			<view v-if="!!item.forwardId&&item.forwardId!=item.studentId">下级审批人：{{item.forwardName}}</view>
			<view class="tool">
				<view v-if="item.finalStatus==0" class="no">
					<u-button v-if="item.forwardId!==item.studentId&&!!item.forwardId" type="info" text="移交"
						@click="toNext(item)"></u-button>
					<u-button v-if="teacherId!=item.studentId" type="error" text="驳回"
						@click="toReject(item)"></u-button>
					<u-button v-if="teacherId!=item.studentId" type="primary" text="通过"
						@click="toPass(item)"></u-button>
					<u-button v-if="teacherId==item.studentId" type="info" text="审批流程中..."
						@click="toCheck(item)"></u-button>
				</view>
				<view v-else class="yes">
					<u-button type="success" :text="item.finalStatusName" @click="toCheck(item)"></u-button>
				</view>
			</view>

		</view>
		<view v-if="!!approvalList||approvalList.length===0">
			<u-empty mode="data" icon="http://cdn.uviewui.com/uview/empty/data.png">
			</u-empty>
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
		updateRecord,
		getRecordDetail
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
  import config from '../../config'

  export default {
		data() {
			return {
				teacherId: null,
        BASE_URL: config.baseUrl,
				approvalList: [],
				leaveTypeList: [],
				approvalTypeList: [],
				recordData: {
					details: []
				},
				commentShow: false,
				checkShow: false,
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
				getDictInfo('class_approval_type').then(res => {
					this.approvalTypeList = res.data
				})
			},
			getMyApproval() {
				getRecordApp({
					approverId: this.teacherId
				}).then(res => {
					this.approvalList = res.data || []
					let records = res.data || []

					// 创建一个空数组来存放选取的记录
					const selectedTasks = [];

					// 创建一个对象来存放已经处理的任务，键为 taskId
					const processedTasks = {};

					// 遍历任务数组
					records.forEach(task => {
					    // 如果当前任务已经被处理过，则跳过
					    if (processedTasks[task.leaveId]) return;

					    // 检查当前任务中是否存在 status 为 0 的记录
					    const hasStatusZero = records.some(t => t.leaveId === task.leaveId && t.status === 0);

					    if (hasStatusZero) {
					        // 如果存在 status 为 0 的记录，则选取第一个满足条件的记录，并将当前任务标记为已处理
					        const selectedTask = records.find(t => t.leaveId === task.leaveId && t.status === 0);
					        selectedTasks.push(selectedTask);
					        processedTasks[selectedTask.leaveId] = true;
					    } else {
					        // 如果不存在 status 为 0 的记录，则选取序号 id 最高的记录，并将当前任务标记为已处理
					        const maxIdTask = records.filter(t => t.leaveId === task.leaveId)
					                               .reduce((prev, current) => (prev.approvalId > current.approvalId) ? prev : current);
					        selectedTasks.push(maxIdTask);
					        processedTasks[maxIdTask.leaveId] = true;
					    }
					});

					this.approvalList = selectedTasks

					this.approvalList.forEach(item => {
						item.finalStatusName = this.approvalTypeList.find(i => i.dictValue == item
							.finalStatus).dictLabel
            item.imgList = item.img.split(',').map(i=> {
              const a = {
                url:this. BASE_URL + i
              }
              return a
            })
						var startDate = new Date(item.startTime); // 开始日期
						var endDate = new Date(item.endTime); // 结束日期
						var startTimeStamp = startDate.getTime() / 1000; // 开始日期的时间戳（秒）
						var endTimeStamp = endDate.getTime() / 1000; // 结束日期的时间戳（秒）
						var timeDiff = Math.abs(endTimeStamp - startTimeStamp);
						var day = (timeDiff / (3600 * 24)).toFixed(1);
						if (day == 0) {
							day = (timeDiff / (3600 * 24)).toFixed(2);
						}
						item.useTime = day
					})
				})
			},
			toConfirmComment() {
				this.commentShow = false
				const myDate = parseTime(new Date())
				if (this.approvalName === '通过') {
					if (!this.comment) {
						this.comment = this.approvalName
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
					if (this.detail.forwardId === this.detail.studentId || !this.detail.forwardId) {
						updateLeave({
							id: this.detail.leaveId,
							status: 1,
							studentId: this.detail.studentId
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

				} else if (this.approvalName === '驳回') {
					if (!this.comment) {
						this.comment = this.approvalName
					}
					updateRecord({
						id: this.detail.approvalId,
						status: 2,
						comment: this.comment,
						approvalTime: myDate
					}).then(res => {
						this.getMyApproval()
						this.$modal.msgSuccess(res.msg)
					})
					updateLeave({
						id: this.detail.leaveId,
						status: 2,
						studentId: this.detail.studentId
					})
					const recipientId = []
					recipientId.push(this.detail.studentId)
					addInfo({
						recipientId: JSON.stringify(recipientId),
						title: '审批驳回通知',
						content: `${this.detail.studentName},你的${this.leaveTypeList.find(i=>i.dictValue==this.detail.type).dictLabel}审批已被驳回。驳回原因：${this.comment}`,
						type: 0,
						sendTime: myDate,
						priority: 10,
						source: 0
					})


				} else if (this.approvalName === '移交') {
					const recipientId = []
					recipientId.push(this.detail.forwardId)
					updateRecord({
						id: this.detail.approvalId,
						status: 4,
						comment: this.comment ? this.comment : `已将${this.detail.studentName}的审批转交给你`,
						approvalTime: myDate
					}).then(res => {
						this.getMyApproval()
						this.$modal.msgSuccess(res.msg)
					})
					addInfo({
						recipientId: JSON.stringify(recipientId),
						title: '审批转交通知',
						content: `${this.detail.forwardName},${this.detail.approverName}已将${this.detail.studentName}的${this.leaveTypeList.find(i=>i.dictValue==this.detail.type).dictLabel}审批转交给你，请及时审批！`,
						type: 0,
						sendTime: myDate,
						priority: 10,
						source: 0
					})

				}

			},
			toPass(item) {
				this.detail = item
				this.approvalName = '通过'
				const text = !!item.forwardId ? '确认通过此申请吗！\n下级审批人：' + item.forwardName : '确认通过此申请吗！'
				this.$modal.confirm(text, '请确认', '通过', '考虑一下').then(() => {
					this.commentShow = true;
				}).catch(() => {

				})
			},
			toReject(item) {
				this.detail = item
				this.approvalName = '驳回'
				this.$modal.confirm('确认要驳回此申请吗！', '请确认', '驳回', '考虑一下').then(() => {
					this.commentShow = true;
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
					this.commentShow = true;
				}).catch(() => {

				})
			},
			checkOpen() {

			},
			toCheck(item) {
				console.log(item);
				getRecordDetail(item.leaveId).then(res => {
					this.recordData = res.data
					const details = this.recordData.details
					this.recordData.currentDot = -1
					for (var i = 0; i < details.length; i++) {
						if (details[i].status != 0) {
							this.recordData.currentDot += 1
						}
					}
					this.recordData.approverName = item.studentName
					this.recordData.approverId = item.studentId
					this.recordData.imgList = item.imgList
					this.recordData.typeName = this.leaveTypeList.find(i => i.dictValue == this.recordData.type)
						.dictLabel
					this.recordData.statusName = this.approvalTypeList.find(i => i.dictValue == this.recordData
						.status).dictLabel
					var startDate = new Date(this.recordData.startTime); // 开始日期
					var endDate = new Date(this.recordData.endTime); // 结束日期
					var startTimeStamp = startDate.getTime() / 1000; // 开始日期的时间戳（秒）
					var endTimeStamp = endDate.getTime() / 1000; // 结束日期的时间戳（秒）
					var timeDiff = Math.abs(endTimeStamp - startTimeStamp);
					var day = (timeDiff / (3600 * 24)).toFixed(1);
					if (day == 0) {
						day = (timeDiff / (3600 * 24)).toFixed(2);
					}
					this.recordData.useTime = day
				})
				this.checkShow = true;


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

			.no,
			.yes {
				display: flex !important;
				justify-content: space-between;
			}
		}
	}

	.popup {
		padding: 16px;
		height: 700px;

		.type {
			font-size: 24px;
			font-weight: bold;

			.usetime {
				font-size: 18px;
				font-weight: 500;
			}
		}

		.reason {
			font-size: 18px;
		}

		.time {
			font-size: 14px;
		}

		.container {
			margin: 10px;
		}
	}
  ::v-deep .u-upload__button{
    display: none!important;
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
