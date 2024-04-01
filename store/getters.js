const getters = {
	userRegion:state => state.user.userRegion,
	user: state => state.user.user,
	token: state => state.user.token,
	avatar: state => state.user.avatar,
	name: state => state.user.name,
	roles: state => state.user.roles,
	permissions: state => state.user.permissions
}
export default getters