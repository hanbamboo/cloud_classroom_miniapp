<template>
  <view>
    <u--form labelPosition="left" :model="form" labelWidth="120">
      <u-form-item label="签到课程" prop="courseId" borderBottom @click="courseChooseShow = true; "
                   style="width: 100%;">
        <text>{{ !!form.courseId ? form.courseName : '请选择' }}</text>
        <u-icon slot="right" name="arrow-right"></u-icon>
      </u-form-item>
      <u-form-item label="课程教师" prop="teacherId" borderBottom style="width: 100%;">
        <text>{{ form.teacherName }}</text>
      </u-form-item>
      <u-form-item label="持续时间(分钟)" prop="duration" borderBottom style="width: 100%;">
        <u-number-box :min="5" :max="30" :step="1" integer v-model="duration"></u-number-box>
        <!--				<u-icon slot="right" name="arrow-right"></u-icon>-->
      </u-form-item>
      <u-form-item label="签到方法" prop="method" borderBottom @click="checkinMethodShow = true; "
                   style="width: 100%;">
        <text>{{ !!form.method ? form.methodName : '请选择' }}</text>
        <u-icon slot="right" name="arrow-right"></u-icon>
      </u-form-item>
      <u-form-item v-if="form.method==1" label="签到密码" borderBottom style="width: 100%;">
        <u-code-input v-model="pwd" :maxlength="4" mode="line"></u-code-input>
      </u-form-item>

      <u-button v-if="form.method" shape="circle" class="margin-top:10px;" type="primary"
                :text="`立即发起${duration}分钟的${form.methodName}`" @click="addCheckInConfirm"></u-button>

    </u--form>
    <u-popup mode="bottom" :show="courseChooseShow" :round="8" :overlay="true" @close="courseChooseShow=false"
             closeable="true" :zIndex="999999">
      <view class="course-view">
        <view class="title">选择你的课程</view>
        <view class="border" v-for="(item,index) in courseChooseList" :key="index" @click.stop="myCourse(item)">
          <view class="name text-blue">{{ item.name }}</view>
          <view class="time text-gray">上课时间：{{ item.time }}</view>
          <image class="image" :src="BASE_URL+item.cover"></image>
        </view>
      </view>
    </u-popup>
    <u-datetime-picker :show="checkinTimeShow" v-model="form.startTime" mode="datetime" closeOnClickOverlay
                       @cancel="checkinTimeShow=false" @close="checkinTimeShow=false"></u-datetime-picker>
    <u-picker :show="checkinMethodShow" :columns="checkinMethodActions" keyName="dictLabel"
              @cancel="checkinMethodShow = false" @confirm="checkinMethodConfirm"></u-picker>
  </view>
</template>

<script>
import {listInfoApp} from "../../api/course/info";
import {addCheckin} from "../../api/checkin/checkin";
import config from '@/config'
import {parseTime} from "../../utils/ruoyi";
import {
  getDictInfo
} from '@/api/system/dict'

export default {
  data() {
    return {
      form: {},
      userId: '',
      roleKey: '',
      BASE_URL: '',
      duration: 5,
      pwd: '',
      checkinMethodShow: false,
      checkinTimeShow: false,
      courseChooseShow: false,
      checkinMethodActions: [],
      courseChooseList: [],
    }
  },
  onLoad(option) {
    this.BASE_URL = config.baseUrl
    this.userId = option.id
    this.roleKey = option.roleKey
    this.form.teacherId = this.$store.state.user.user.userId
    this.form.teacherName = this.$store.state.user.user.nickName
    this.getCourseList()
    this.getDict()
  },
  methods: {
    getDict() {
      getDictInfo('class_checkin_type').then(res => {
        this.checkinMethodActions = []
        this.checkinMethodActions.push(res.data)
      })
    },
    myCourse(item) {
      this.form.courseId = item.id
      this.form.courseName = item.name
      this.courseChooseShow = false
    },
    addCheckInConfirm() {
      if (this.form.method === 1 && !this.pwd) {
        this.$modal.showToast("密码未填写")
        return
      }
      if (this.form.method === 1) {
        this.form.source = JSON.stringify({
          pwd: this.pwd
        })
      }
      this.form.id = uni.$u.guid(20)
      const date = new Date()
      this.form.startTime = parseTime(date)
      date.setMinutes(date.getMinutes() + this.duration)
      this.form.endTime = parseTime(date)
      addCheckin(this.form).then(res => {
        this.$modal.msgSuccess(res.msg)
        uni.navigateBack()
      })
    },
    getCourseList() {
      listInfoApp({
        teacherId: this.userId
      }).then(res => {
        this.courseChooseList = res.data
      })

    },
    checkinMethodConfirm(e) {
      const index = e.indexs[0]
      this.form.method = this.checkinMethodActions[0][index].dictValue
      this.form.methodName = this.checkinMethodActions[0][index].dictLabel
      this.checkinMethodShow = false
    },
  }
}
</script>
<style lang="scss" scoped>
.course-view {
  max-height: 80%;
  overflow-y: auto;
  margin: 8px;

  .title {
    font-size: 20px;
    font-weight: bold;
    margin: 5px 5px 30px 5px;
  }

  .border {
    padding: 8px;
    border-radius: 8px;
    border: 1px solid #5473E8;
    position: relative;
    margin: 0 0 8px 0;
  }

  .name {
    font-weight: bold;
    font-size: 18px;

  }

  .image {
    padding: 8px;
    position: absolute;
    height: 100%;
    width: 100px;
    right: 0;
    top: 0;
  }
}
</style>
<style lang="scss">
page {
  padding: 16px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background-color: #fff;
  min-height: 100%;
  height: auto;
}
</style>
