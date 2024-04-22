import request from '@/utils/request'

// 查询审批结果列表
export function listRecord(query) {
  return request({
    url: '/approval/record/list',
    method: 'get',
    params: query
  })
}

// 查询审批结果详细
export function getRecord(id) {
  return request({
    url: '/approval/record/' + id,
    method: 'get'
  })
}

export function getRecordNum(id) {
  return request({
    url: '/approval/record/num/' + id,
    method: 'get'
  })
}
export function getRecordApp(data) {
  return request({
    url: '/approval/record/app/get',
    method: 'get',
	params:data
  })
}

// 新增审批结果
export function addRecord(data) {
  return request({
    url: '/approval/record',
    method: 'post',
    data: data
  })
}

// 修改审批结果
export function updateRecord(data) {
  return request({
    url: '/approval/record',
    method: 'put',
    data: data
  })
}

// 删除审批结果
export function delRecord(id) {
  return request({
    url: '/approval/record/' + id,
    method: 'delete'
  })
}
