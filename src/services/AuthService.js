import axios from 'axios'

class AuthService {

    logError (error) {
        console.log(error);
    }

    login ({email, password}) {
        return axios.post('login', {
            email,
            password
        }).then(resp => {
            let data = resp.data ? resp.data : null
            if (data) {
                if (data.status == 200) {
                    localStorage.setItem('token', JSON.stringify(data.jwt))
                    localStorage.setItem('user', data.name)
                    axios.defaults.headers.common['Authorization'] = `Bearer ${data.jwt}`
                    return true
                } else {
                    return false
                }
            }
        }).catch(this.logError)
    }
}

export default AuthService