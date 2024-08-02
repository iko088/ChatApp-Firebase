import { useEffect } from "react"
import Chat from "./Components/chat/Chat"
import Detail from "./Components/detail/Detail"
import List from "./Components/list/List"
import Login from "./Components/login/Login"
import Notificaion from "./Components/notificaion/Notificaion"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "./lib/firebase"
import { useUserStore } from "./lib/userStore"
import { useChatStore } from "./lib/chatStore"

const App = () => {

  const {currentUser, isLoading, fetchUserInfo} = useUserStore();
  const { chatId } = useChatStore();

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid)
    });

    return () => {
      unSub()
    }
  }, [fetchUserInfo]);

  console.log(currentUser)

  // if(isLoading) return <div className="loading">Loading....</div>
  if(isLoading) return <div className="loader"></div>

  return (
    <div className='container'>
      { currentUser ? (
       <>
        <List/>
        {chatId && <Chat/>}
        {chatId && <Detail/>}
        </>
      ) : (
        <Login/>
      )}
      <Notificaion/>
    </div>
  )
}

export default App