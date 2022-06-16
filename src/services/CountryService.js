import axios from 'axios'

class CountryService {

    source;

    logError (error) {
        console.error(error)
    }

    fetchData (response) {
        return response.data
    }

    save ({name, country}) {
        return axios.post(`countries`, {name, country})
        .then(this.fetchData)
        .catch(this.logError)
    }

    update (item) {
        const { name } = item
        return axios.put(`countries/${item.id}`, {
            ...item, 
            name
        }).then(this.fetchData)
        .catch(this.logError)
    }

    getList () {
        return axios.get('countries')
        .then(this.fetchData)
        .catch(this.logError)
    }

    delete ({id}) {
        return axios.delete(`countries/${id}`)
        .then(this.fetchData)
        .catch(this.logError)
    }

    updateStatus (row) {
        return axios.put(`countries/${row.id}`, { ...row, status: row.status })
        .then(this.fetchData)
        .catch(this.logError)
    }

    search (name) {
        if(this.source) {
            this.source.cancel()
        }
        const CancelToken = axios.CancelToken;
        this.source = CancelToken.source()
        return axios.get(`countries/name?q=${name}`, {
            cancelToken: this.source.token
        })
        .then(this.fetchData)
        .catch(function(thrown) {
            if (axios.isCancel(thrown)) {
                console.log('Request canceled', thrown.message)
            } else {
                console.log("cancel error")
            }
        })
    }
}

export default CountryService