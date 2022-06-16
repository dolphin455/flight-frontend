import axios from "axios";

class UserService {

    fetchData (response) {
        return response.data
    }

    logError (response) {
        console.error(response);
    }

    save (params) {
        return axios.post('save-user', { 
            name: "",
            email: params.email,
            password: "",
            contact: Number(params.contact),
            iso: "",
            extension: params.extension
        }).then(this.fetchData)
        .catch(this.logError)
    }
}

export default UserService