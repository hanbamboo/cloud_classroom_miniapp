import upload from '@/utils/upload'
import request from '@/utils/request'

// 查询学生拥有的课程列表
export function listRecord(query) {
  return request({
    url: '/course/record/list',
    method: 'get',
    params: query
  })
}

// 查询学生拥有的课程列表
export function listRecordApp(query) {
  return request({
    url: '/course/record/app/list',
    method: 'get',
    params: query
  })
}

// 查询学生拥有的课程详细
export function getRecord(id) {
  return request({
    url: '/course/record/' + id,
    method: 'get'
  })
}

// 新增学生拥有的课程
export function addRecord(data) {
  return request({
    url: '/course/record',
    method: 'post',
    data: data
  })
}

// 查询学生在某个课程中的人数与存在与否
export function courseNumStatus(data) {
  return request({
    url: '/course/record/courseNumStatus',
    method: 'post',
    data: data
  })
}

// 新增学生拥有的课程（批量增加）
export function addRecordBatch(data) {
  return request({
    url: '/course/record/addBacth',
    method: 'post',
    data: data
  })
}

// 修改学生拥有的课程
export function updateRecord(data) {
  return request({
    url: '/course/record',
    method: 'put',
    data: data
  })
}

// 删除学生拥有的课程
export function delRecord(id) {
  return request({
    url: '/course/record/' + id,
    method: 'delete'
  })
}
