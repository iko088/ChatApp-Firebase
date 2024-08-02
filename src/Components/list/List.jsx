import './list.css' 
import Userinfo from "./Userinfo/Userinfo"
import ChatList from "./ChatList/ChatList"

const List = () => {
  return (
    <div className='list'>
      <Userinfo/>
      <ChatList/>
    </div>
  )
}

export default List
