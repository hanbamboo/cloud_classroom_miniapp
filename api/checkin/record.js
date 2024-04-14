import request from '@/utils/request'

// 查询签到明细列表
export function listRecord(query) {
  return request({
    url: '/checkIn/record/list',
    method: 'get',
    params: query
  })
}

export function listRecordApp(query) {
  return request({
    url: '/checkIn/record/app/list',
    method: 'get',
    params: query
  })
}

export function listRecordAppRecord(query) {
  return request({
    url: '/checkIn/record/app/record',
    method: 'get',
    params: query
  })
}

// 签到
export function getRecordAppCheckin(data) {
  return request({
    url: '/checkIn/record/app/checkin',
    method: 'post',
    data: data
  })
}
// 签到数据是否签到
export function getRecordAppCheckinRecord(checkinId,studentId) {
  return request({
    url: '/checkIn/record/'+checkinId+"/"+studentId,
    method: 'get',
  })
}


// 查询签到明细详细
export function getRecord(id) {
  return request({
    url: '/checkIn/record/' + id,
    method: 'get'
  })
}

// 新增签到明细
export function addRecord(data) {
  return request({
    url: '/checkIn/record',
    method: 'post',
    data: data
  })
}

// 修改签到明细
export function updateRecord(data) {
  return request({
    url: '/checkIn/record',
    method: 'put',
    data: data
  })
}

// 删除签到明细
export function delRecord(id) {
  return request({
    url: '/checkIn/record/' + id,
    method: 'delete'
  })
}
