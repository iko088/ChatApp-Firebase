import { useEffect, useRef, useState } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/upload";

const Chat = () => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [chat, setChat] = useState();
  const [img, setImg] = useState({
    file: null,
    url: "",
  });

  const { chatId, user, isReceiverBlock, isCurrentUserBlocked } = useChatStore();
  const { currentUser } = useUserStore();

  const endRef = useRef(null);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });

    return () => {
      unSub();
    };
  }, [chatId]);

  useEffect(() => {
    if (chat) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat]);

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
  };

  const handleImg = (e) => {
    if (e.target.files) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSend = async () => {
    if (text === "") return;

    let imgUrl = null;

    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }
      // Update the chat document with the new message
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
          ...(imgUrl && { img: imgUrl }),
        }),
      });

      // Update the userChats document for each user
      const userIDs = [currentUser.id, user.id];

      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === chatId
          );

          if (chatIndex !== -1) {
            userChatsData.chats[chatIndex].lastMessage = text;
            userChatsData.chats[chatIndex].isSeen = id === currentUser.id;
            userChatsData.chats[chatIndex].updatedAt = Date.now();

            await updateDoc(userChatsRef, {
              chats: userChatsData.chats,
            });
          } else {
            console.error(
              `Chat with chatId: ${chatId} not found in userChats for user: ${id}`
            );
          }
        } else {
          console.error(`userChats document not found for user: ${id}`);
        }
      });
    } catch (error) {
      console.log("Chat.jsx" + error);
    }

    setImg({
      file: null,
      url: "",
    });

    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
      setText("");
    }
  };

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src={isCurrentUserBlocked ?  "./avatar.png" : user?.avatar } alt="" />
          <div className="texts">
            <span> {isCurrentUserBlocked ? "none" : user?.username} </span>
            <p>Lorem ipsum dolor, sit amet.</p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="" /> <img src="./video.png" alt="" />
          <img src="./info.png" alt="" />
        </div>
      </div>

      <div className="center">
        {chat?.messages?.map((message, index) => (
          <div className={message.senderId === currentUser.id ? "message own" : "message"} key={index}>
            <div className="texts">
              {message.img && <img src={message.img} alt="" />}
              <p>{message.text}</p>
            </div>
          </div>
        ))}
        {img.url && (
          <div className="message own">
            <div className="texts">
              <img src={img.url} alt="" />
            </div>
          </div>
        )}
        <div ref={endRef}></div>
      </div>

      <div className="bottom">
        <div className="icons">
          <label htmlFor="fileUpload">
            <img src="./img.png" alt="" />
          </label>
          <input
            type="file"
            id="fileUpload"
            style={{ display: "none" }}
            onChange={handleImg}
            disabled={isReceiverBlock || isCurrentUserBlocked}
          />
          <img src="./camera.png" alt="" />
          <img src="./mic.png" alt="" />
        </div>
        <input
          type="text"
          value={text}
          placeholder="Type a message..."
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isReceiverBlock || isCurrentUserBlocked}
        />
        <div className="emoji">
          <img
            src="./emoji.png"
            alt=""
            onClick={() => setOpen((prev) => !prev)}
          />
          <div className="picker">
            {open && <EmojiPicker onEmojiClick={handleEmoji} />}
          </div>
        </div>
        <button
          className="sendButton"
          onClick={handleSend}
          disabled={isReceiverBlock || isCurrentUserBlocked}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
