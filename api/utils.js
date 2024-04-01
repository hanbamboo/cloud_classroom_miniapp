import upload from '@/utils/upload'
import request from '@/utils/request'

// 公共上传
export function commpnUpload(data) {
	return request({
		url: '/common/upload',
		method: 'post',
		data: data,
		Headers: {
			"content-type": "multipart/form-data",
		}
	})
}