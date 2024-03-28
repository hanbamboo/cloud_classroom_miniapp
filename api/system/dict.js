import upload from '@/utils/upload'
import request from '@/utils/request'


export function getDictInfo(name) {
	return request({
		url: '/system/dict/data/type/' + name,
		method: 'get'
	})
}