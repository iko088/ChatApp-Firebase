import { auth, db } from "../../lib/firebase";
import "./detail.css";
import { useChatStore } from "../../lib/chatStore";
import { arrayRemove, arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { useUserStore } from "../../lib/userStore";
import { useEffect, useState } from "react";

const Detail = () => {
  const { chatId, user, isCurrentUserBlock, isReceiverBlock, changeBlock } = useChatStore();
  const { currentUser } = useUserStore();
  const [isBlockedByUser, setIsBlockedByUser] = useState(false);

  useEffect(() => {
    const fetchBlockStatus = async () => {
      if (!user) return;

      const userDocRef = doc(db, "users", user.id);
      try {
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.data();
        if (userData?.blocked?.includes(currentUser.id)) {
          setIsBlockedByUser(true);
        } else {
          setIsBlockedByUser(false);
        }
      } catch (error) {
        console.error("Failed to fetch block status", error);
      }
    };

    fetchBlockStatus();
  }, [user, currentUser.id]);

  const handleBlock = async () => {
    if (!user) return;

    const userDocRef = doc(db, "users", currentUser.id);

    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlock ? arrayRemove(user.id) : arrayUnion(user.id)
      });
      changeBlock(); // Update block status in the chat store
      toast.success(`User ${isReceiverBlock ? 'unblocked' : 'blocked'} successfully.`);
    } catch (error) {
      console.error("Failed to update block status", error);
      toast.error("Failed to update block status.");
    }
  };

  return (
    <div className="detail">
      <div className="user">
        <img src={isCurrentUserBlock || isBlockedByUser ? "/avatar.png" : user?.avatar } alt="User Avatar" />
        <h2>{ isCurrentUserBlock || isBlockedByUser ? "none" :  user?.username }</h2>
        <p>Lorem ipsum dolor sit amet.</p>
      </div>
      <div className="info">
        <div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <img src="./arrowUp.png" alt="Arrow Up" />
          </div>
        </div>

        <div className="option">
          <div className="title">
            <span>Privacy & Help</span>
            <img src="./arrowUp.png" alt="Arrow Up" />
          </div>
        </div>

        <div className="option">
          <div className="title">
            <span>Shared Photos</span>
            <img src="./arrowDown.png" alt="Arrow Down" />
          </div>
          <div className="photoParent">
            <div className="photos">
              {/* Example photos - replace with actual content */}
              <div className="photoitem">
                <div className="photoDetail">
                  <img src="https://plus.unsplash.com/premium_photo-1667520478403-c51b07ba91bd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Photo" />
                  <span>iko.png</span>
                </div>
                <img src="/download.jpg" alt="Download Icon" className="icon" />
              </div>
              {/* Repeat for other photos */}
            </div>
          </div>
        </div>

        <div className="option">
          <div className="title">
            <span>Shared Files</span>
            <img src="./arrowUp.png" alt="Arrow Up" />
          </div>
        </div>
        
        <button onClick={handleBlock} disabled={isBlockedByUser}>
          {isCurrentUserBlock ? "You're Blocked" : isBlockedByUser ? "You're Blocked" : "Block User"}
        </button>
        <button className="logout" onClick={() => auth.signOut()}>Logout</button>
      </div>
    </div>
  );
};

export default Detail;
