import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import { Landing } from './screens/Landing'
import { Signin } from './screens/Signin'
import { Signup } from './screens/Signup'
import ProtectedRoutes from './utils/ProtectedRoutes'
import Profile from './screens/Profile'
import { GamePage } from './screens/GamePage'
import { RecoilRoot } from 'recoil'
import BotGamePage from './screens/BotGame'

function App() {

  return (
    <RecoilRoot>
      <BrowserRouter>
        <Routes>
          <Route element={<ProtectedRoutes />}>
            <Route path='/game-bot' element={<BotGamePage />} />
            <Route path='/game-online' element={<GamePage />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/account/:id' element={<Profile />} />
          </Route>
          <Route path='/' element={<Landing />} />
          
          <Route path='/signup' element={<Signup />} />
          <Route path='/signin' element={<Signin />} />
        </Routes>
      </BrowserRouter>
      </RecoilRoot>
  )
}

export default App
