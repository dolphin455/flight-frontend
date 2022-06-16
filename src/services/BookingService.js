import axios from "axios";

class BookingService {

    fetchData (response) {
        return response.data
    }

    logError (response) {
        console.error(response);
    }

    search (query) {
        return axios.post(`search-flights`, {
            ...query
        })
        .then(this.fetchData)
        .catch(this.logError)
    }

    bookTicket (params) {
        return axios.post('save-booking', { ...params })
        .then(this.fetchData)
        .catch(this.logError)
    }

    savePassengers (params, passengers) {
        return axios.post("save-passengers/"+params.id, {
            passengers: [ ...passengers ]
        }).then(this.fetchData)
        .catch(this.logError)
    }

    getTypes () {
        return axios.get("get-passenger-types")
        .then(this.fetchData)
        .catch(this.logError)
    }

    updateSeat (id, seats) {
        return axios.get('seats?schedulesId='+id).then((resp) => {
            let seat = resp.data[0]
            let remaining = Number(seat.remaining) - Number(seats)
            return axios.put('seats/' + seat.id, { ...seat, remaining })
            .then(this.fetchData)
            .catch(this.logError)    
        }).catch(this.logError)
    }

    async lookupAirline (data) {
        return axios.get('airlines/' + data.schedules.airlinesId)
        .then(this.fetchData)
    }

    async loopData (data) {
        data.forEach(async (item, index) => {
            let airline = await this.lookupAirline(item)
            item.airline = { ...airline }
        })
        return data
    }

    lookupBookingHistory (params) {
        return axios.get("get-history?type="+params.type+"&text="+params.text)
        .then(this.fetchData)
        .catch(this.logError)
    }

    lookupBookings ({ type, text }, active = 1) {
        return axios.get(`user-bookings?type=${type}&text=${text}&active=${active}`)
        .then(this.fetchData)
        .catch(this.logError)
    }

    removePassengers (data) {
        data.forEach((item, index) => {
            axios.delete('passengers/' + item.id).then(() => {
                
            })
        })
        return
    }

    cancelBooking ({ id }) {
        return axios.get("cancel-booking/"+id)
        .then(this.fetchData)
        .catch(this.logError)
    }
}

export default BookingService