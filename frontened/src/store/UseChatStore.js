import toast from "react-hot-toast";
import { create } from "zustand";
import { axiosInstanace } from "../lib/axios";
import { useAuthStore } from "./UseAuthStore";

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],           // friends list
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    // Friend system state
    searchResults: [],
    isSearching: false,
    pendingRequests: [],

    // Fetch friends (replaces old getUsers)
    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstanace.get("/friends");
            set({ users: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isUsersLoading: false });
        }
    },

    // Search users by name
    searchUsers: async (query) => {
        if (!query.trim()) return set({ searchResults: [] });
        set({ isSearching: true });
        try {
            const res = await axiosInstanace.get(`/friends/search?query=${query}`);
            set({ searchResults: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isSearching: false });
        }
    },

    // Send friend request
    sendFriendRequest: async (userId) => {
        try {
            await axiosInstanace.post(`/friends/request/${userId}`);
            // Mark as sent in search results
            set((state) => ({
                searchResults: state.searchResults.map((u) =>
                    u._id === userId ? { ...u, iSentRequest: true } : u
                ),
            }));
            toast.success("Friend request sent!");
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },

    // Accept friend request
    acceptFriendRequest: async (userId) => {
        try {
            await axiosInstanace.post(`/friends/accept/${userId}`);
            // Remove from pending, add to friends
            const { pendingRequests, users } = get();
            const accepted = pendingRequests.find((r) => String(r.from._id) === String(userId));
            set({
                pendingRequests: pendingRequests.filter((r) => String(r.from._id) !== String(userId)),
                users: accepted ? [...users, accepted.from] : users,
            });
            toast.success("Friend request accepted!");
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },

    // Fetch incoming pending requests
    getPendingRequests: async () => {
        try {
            const res = await axiosInstanace.get("/friends/requests");
            set({ pendingRequests: res.data });
        } catch (error) {
            console.log("Error fetching pending requests", error);
        }
    },

    friendStatuses: [],
    myStatus: null,
    isStatusLoading: false,

    getFriendStatuses: async () => {
        set({ isStatusLoading: true });
        try {
            const res = await axiosInstanace.get("/status/friends");
            set({ friendStatuses: res.data });
        } catch (error) {
            console.log("Error fetching friend statuses", error);
        } finally {
            set({ isStatusLoading: false });
        }
    },

    getMyStatus: async () => {
        try {
            const res = await axiosInstanace.get("/status/me");
            set({ myStatus: res.data });
        } catch (error) {
            console.log("Error fetching my status", error);
        }
    },

    createStatus: async (statusData) => {
        set({ isStatusLoading: true });
        try {
            const res = await axiosInstanace.post("/status", statusData);
            set({ myStatus: res.data });
            await get().getFriendStatuses();
            toast.success("Status posted successfully");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Unable to post status");
        } finally {
            set({ isStatusLoading: false });
        }
    },

    subscribeToStatusEvents: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;
        socket.on("newStatus", (status) => {
            set((state) => ({
                friendStatuses: [
                    status,
                    ...state.friendStatuses.filter((item) => item.statusId !== status.statusId),
                ],
            }));
        });
    },

    unsubscribeFromStatusEvents: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;
        socket.off("newStatus");
    },

    // Socket: someone accepted my request → add them to friends list live
    subscribeToFriendEvents: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.on("friendRequestAccepted", ({ newFriend }) => {
            set((state) => ({
                users: [...state.users, newFriend],
            }));
            toast.success(`${newFriend.fullName} accepted your friend request!`);
        });

        socket.on("newFriendRequest", ({ from }) => {
            set((state) => ({
                pendingRequests: [...state.pendingRequests, { from, status: "pending" }],
            }));
            toast(`${from.fullName} sent you a friend request!`, { icon: "👋" });
        });
    },

    unsubscribeFromFriendEvents: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;
        socket.off("friendRequestAccepted");
        socket.off("newFriendRequest");
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstanace.get(`/messages/${userId}`);
            set({ messages: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        try {
            const res = await axiosInstanace.post(`/messages/send/${selectedUser._id}`, messageData);
            set({ messages: [...messages, res.data] });
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },

    subscribeToMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.on("newMessage", (newMessage) => {
            const { selectedUser } = get();

            // Chat is open with this sender → mark seen immediately
            if (selectedUser && newMessage.senderId === selectedUser._id) {
                set({ messages: [...get().messages, newMessage] });
                // correct URL: /messages/seen/:senderId
                axiosInstanace.post(`/messages/seen/${newMessage.senderId}`).catch(console.error);
            } else {
                // Chat not open → increment unread badge
                set((state) => ({
                    users: state.users.map((u) =>
                        u._id === newMessage.senderId
                            ? { ...u, unreadCount: (u.unreadCount || 0) + 1 }
                            : u
                    ),
                }));
            }
        });
    },

    unsubscibeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
    },

    setSelectedUser: (selectedUser) => {
        // Reset unread count for this user immediately in UI
        set((state) => ({
            selectedUser,
            users: state.users.map((u) =>
                u._id === selectedUser._id ? { ...u, unreadCount: 0 } : u
            ),
        }));
        // Also mark as seen in DB
        axiosInstanace.post(`/messages/seen/${selectedUser._id}`).catch(console.error);
    },

    declineFriendRequest: async (userId) => {
        try {
            await axiosInstanace.post(`/friends/decline/${userId}`);  // fixed
            set((state) => ({
                pendingRequests: state.pendingRequests.filter(
                    (req) => String(req.from._id) !== String(userId)
                ),
            }));
            toast.success("Request declined");
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        }
    },
}));