import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import { Landing } from './screens/Landing'
import { Game } from './screens/Game'
import { Signin } from './screens/Signin'
import { Signup } from './screens/Signup'
import ProtectedRoutes from './utils/ProtectedRoutes'

function App() {

  return (
    <div className=''>
      <BrowserRouter>
        <Routes>
          <Route element={<ProtectedRoutes />}>
            <Route path='/game' element={<Game />} />
          </Route>
          <Route path='/' element={<Landing />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/signin' element={<Signin />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
