import { Routes, Route } from 'react-router-dom'
import Admin from './components/admin/Admin';
import AdminLogin from './components/admin/AdminLogin';
import Error from './components/Error';
import BookFlight from './components/user/BookFlight';
import Frontend from './components/user/Frontend';
import AirlineSchedule from './components/admin/airline/AirlineSchedule';
import AirlineList from './components/admin/airline/AirlineList';
import Airport from './components/admin/Airport';
import BookingHistory from './components/user/BookingHistory';
import ManageBooking from './components/user/ManageBooking';
import Country from './components/admin/Country';

function App() {
  return (
    <div className="App">
      <Routes>
        {/* user routes */}
        <Route path='/' element={<Frontend />}>
          <Route index element={<BookFlight />} />
          <Route path='history' element={<BookingHistory />} />
          <Route path='booking' element={<ManageBooking />} />
          <Route path='*' element={<Error />} />
        </Route>

        {/* admin routes */}
        <Route path='/admin' element={<Admin />}>
          <Route index element={<AdminLogin />} />
          <Route path='schedule' element={<AirlineSchedule />} />
          <Route path='airlines' element={<AirlineList />} />
          <Route path='airports' element={<Airport />} />
          <Route path='countries' element={<Country />} />
          <Route path='*' element={<Error />} />
        </Route>
        
      </Routes>
    </div>
  );
}

export default App;