import axios from 'axios'

class AirlineService {

    logError (error) {
        console.error(error)
    }

    fetchData (response) {
        return response.data
    }

    save ({name, address, status}, fileName) {
        return axios.post(`airlines`, {name, logo: fileName, hqAddress: address, status})
        .then(this.fetchData)
        .catch(this.logError)
    }

    uploadImage (logo) {
        return axios.post('airlines/upload', logo)
        .then(this.fetchData)
        .catch(this.logError)
    }

    update (item, logo) {
        const { name, address, id } = item
        return axios.put(`airlines/${item.id}`, {
            id,
            name,
            logo,
            hqAddress: address
        }).then(this.fetchData)
        .catch(this.logError)
    }

    getList () {
        return axios.get('airlines')
        .then(this.fetchData)
        .catch(this.logError)
    }

    getActiveAirlines () {
        return axios.get(`airlines?status=${1}`)
        .then(this.fetchData)
        .catch(this.logError)
    }

    delete ({id}) {
        return axios.delete(`airlines/${id}`)
        .then(this.fetchData)
        .catch(this.logError)
    }

    updateStatus (row) {
        return axios.put(`airlines/${row.id}`, { ...row, status: row.status })
        .then(this.fetchData)
        .catch(this.logError)
    }

    search (name) {
        return axios.get(`airlines?name_like=${name}`)
        .then(this.fetchData)
        .catch(this.logError)
    }

    getScheduleList () {
        return axios.get('flight/get-flights')
        .then(this.fetchData)
        .catch(this.logError)
    }

    getPassengerTypes () {
        return axios.get('passenger_types')
        .then(this.fetchData)
        .catch(this.logError)
    }

    saveSchedule (params) {
        return axios.post(`flight/save-flight`, { 
            ...params, 
            departFrom: Number(params.departFrom), 
            arrivalTo: Number(params.arrivalTo) 
        }).then(this.fetchData)
        .catch(this.logError)
    }

    updateSchedule (record) {
        return axios.put(`flight/update-flight/${record.id}`, {
            ...record
        }).then(this.fetchData)
        .catch(this.logError)
    }

    updateScheduleStatus (row) {
        return axios.get(`flight/update-status?status=${row.status}&id=${row.id}`)
        .then(this.fetchData)
        .catch(this.logError)
    }

    saveSeats (params) {
        return axios.post('flight/save-seat', { ...params })
        .then(this.fetchData)
        .catch(this.logError)
    }

    updateSeats (params) {
        return axios.post('flight/update-seat/'+params.scheduleId, { ...params })
        .then(this.fetchData)
        .catch(this.logError)
    }

    deleteSchedule ({ id }) {
        return axios.delete(`flight/delete/${id}`)
        .then(this.fetchData)
        .catch(this.logError)
    } 
}

export default AirlineService