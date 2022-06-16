export const checkAuth = () => {
    const token = JSON.parse(localStorage.getItem('token'))
    const user = localStorage.getItem('user')
    if (token && user) {
        return true
    }
    return false
}