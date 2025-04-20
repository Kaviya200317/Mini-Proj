import { useState } from 'react'
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import GroceryList from './Contribute/GroceryList.jsx'
import AddItem from './Contribute/AddItem.jsx'
import UpdateList from './Contribute/updateList.jsx'
function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <BrowserRouter>
      <Routes>
        <Route path='/' element={<GroceryList />}>home</Route>
        <Route path='/create' element={<AddItem />}>add</Route>
        <Route path='/update/:id' element={<UpdateList />}>update</Route>

      </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
