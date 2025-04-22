
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import GroceryList from './GroceryList.jsx'
import AddItem from './AddItem.jsx'
import UpdateList from './updateList.jsx'
const GroceryUnit = () => {
    return (
        <div>
          <BrowserRouter>
          <Routes>
            <Route path='/grocery' element={<GroceryList />}></Route>
            <Route path='/create' element={<AddItem />}></Route>
            <Route path='/update/:id' element={<UpdateList />}></Route>
    
          </Routes>
          </BrowserRouter>
        </div>
      )
    
}

export default GroceryUnit;
