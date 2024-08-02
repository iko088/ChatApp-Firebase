import { create } from "zustand";
import { useUserStore } from "./userStore";

export const useChatStore = create((set) => ({
  chatId: null,
  user: null,
  isCurrentUserBlocked: false,
  isReceiverBlock: false,
  changeChat: (chatId, user) => {
    const currentUser = useUserStore.getState().currentUser;

    // CHECK IF CURRENT USER IS BLOCKED
    if (user.blocked.includes(currentUser.id)) {
      return set({
        chatId,
        user,
        isCurrentUserBlocked: true,
        isReceiverBlock: false,
      });
    }

    // CHECK IF RECEIVER USER IS BLOCKED
    else if (currentUser.blocked.includes(user.id)) {
      return set({
        chatId,
        user,
        isCurrentUserBlocked: false,
        isReceiverBlock: true,
      });
    } else {
      return set({
        chatId,
        user,
        isCurrentUserBlocked: false,
        isReceiverBlock: false,
      });
    }
  },
  changeBlock: () => {
    set((state) => ({ ...state, isReceiverBlock: !state.isReceiverBlock }));
  },
}));
