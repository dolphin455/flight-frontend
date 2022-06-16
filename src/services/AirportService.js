import axios from 'axios'

class AirportService {

    logError (error) {
        console.error(error)
    }

    fetchData (response) {
        return response.data
    }

    save ({name, countryId}) {
        return axios.post(`airports`, {name, countryId})
        .then(this.fetchData)
        .catch(this.logError)
    }

    update (item) {
        const { name, id, countryId } = item
        return axios.put(`airports/${item.id}`, {
            ...item, 
            name,
            countryId: Number(countryId)
        }).then(this.fetchData)
        .catch(this.logError)
    }

    getList (params = "") {
        return axios.get('airports' + params)
        .then(this.fetchData)
        .catch(this.logError)
    }

    delete ({id}) {
        return axios.delete(`airports/${id}`)
        .then(this.fetchData)
        .catch(this.logError)
    }

    updateStatus (row) {
        return axios.put(`airports/${row.id}`, { ...row, status: row.status })
        .then(this.fetchData)
        .catch(this.logError)
    }

    search (name) {
        return axios.get(`airports?name_like=${name}`)
        .then(this.fetchData)
        .catch(this.logError)
    }
}

export default AirportService