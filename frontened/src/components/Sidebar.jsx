import React, { useEffect, useState } from "react";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Search, UserPlus, Check, Clock } from "lucide-react";
import { useAuthStore } from "../store/UseAuthStore";
import { useChatStore } from "../store/UseChatStore";

const Sidebar = () => {
    const {
        getUsers, users, selectedUser, setSelectedUser, isUsersLoading,
        searchUsers, searchResults, isSearching,
        sendFriendRequest, acceptFriendRequest, declineFriendRequest,  // ← add this
        getPendingRequests, pendingRequests,
        subscribeToFriendEvents, unsubscribeFromFriendEvents,
    } = useChatStore();

    const { onlineUsers } = useAuthStore();
    const [showOnlineOnly, setShowOnlineOnly] = useState(false);
    const [activeTab, setActiveTab] = useState("chats"); // "chats" | "search"
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        getUsers();
        getPendingRequests();
        subscribeToFriendEvents();
        return () => unsubscribeFromFriendEvents();
    }, []);

    const handleSearch = (e) => {
        const q = e.target.value;
        setSearchQuery(q);
        searchUsers(q);
    };

    const filteredFriends = showOnlineOnly
        ? users.filter((u) => onlineUsers.includes(u._id))
        : users;

    if (isUsersLoading) return <SidebarSkeleton />;

    return (
        <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">

            {/* Header with tabs */}
            <div className="border-b border-base-300 w-full p-5">
                <div className="flex items-center gap-2 mb-3">
                    <Users className="size-6" />
                    <span className="font-medium hidden lg:block">Contacts</span>
                </div>

                {/* Tab switcher */}
                <div className="hidden lg:flex gap-2">
                    <button
                        onClick={() => setActiveTab("chats")}
                        className={`flex-1 text-sm py-1 rounded-lg transition-colors ${
                            activeTab === "chats"
                                ? "bg-primary text-primary-content"
                                : "bg-base-200 hover:bg-base-300"
                        }`}
                    >
                        Chats
                        {users.reduce((sum, u) => sum + (u.unreadCount || 0), 0) > 0 && (
                            <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1">
                                {users.reduce((sum, u) => sum + (u.unreadCount || 0), 0)}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("search")}
                        className={`flex-1 text-sm py-1 rounded-lg transition-colors ${
                            activeTab === "search"
                                ? "bg-primary text-primary-content"
                                : "bg-base-200 hover:bg-base-300"
                        }`}
                    >
                        <Search className="inline size-3 mr-1" />
                        Find
                    </button>
                    <button
                        onClick={() => setActiveTab("requests")}
                        className={`flex-1 text-sm py-1 rounded-lg transition-colors ${
                            activeTab === "requests"
                                ? "bg-primary text-primary-content"
                                : "bg-base-200 hover:bg-base-300"
                        }`}
                    >
                        Requests
                        {pendingRequests.length > 0 && (
                            <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1">
                                {pendingRequests.length}
                            </span>
                        )}
                    </button>
                </div>


                {/* Online only filter — only show on chats tab */}
                {activeTab === "chats" && (
                    <div className="mt-3 hidden lg:flex items-center gap-2">
                        <label className="cursor-pointer flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={showOnlineOnly}
                                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                                className="checkbox checkbox-sm"
                            />
                            <span className="text-sm">Online only</span>
                        </label>
                        <span className="text-xs text-zinc-500">
                            ({onlineUsers.filter(id => users.some(u => u._id === id)).length} online)
                        </span>
                    </div>
                )}
            </div>

            {/* CHATS TAB */}
            {activeTab === "chats" && (
                <div className="overflow-y-auto w-full py-3">

                    {/* Pending requests section */}
                    

                    {/* Friends list */}
                    {filteredFriends.length > 0 && (
                        <p className="text-xs text-zinc-500 uppercase px-3 mb-1 hidden lg:block">
                            Friends ({filteredFriends.length})
                        </p>
                    )}

                    {filteredFriends.map((user) => (
                        <button
                            key={user._id}
                            onClick={() => setSelectedUser(user)}
                            className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${
                                selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""
                            }`}
                        >
                            <div className="relative mx-auto lg:mx-0">
                                <img
                                    src={user.profilePic || "/avatar.png"}
                                    alt={user.fullName}
                                    className="size-12 object-cover rounded-full"
                                />
                                {onlineUsers.includes(user._id) && (
                                    <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
                                )}
                            </div>
                            <div className="hidden lg:block text-left min-w-0">
                                {user.unreadCount > 0 && (
                                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                        {user.unreadCount}
                                    </span>
                                )}
                                <div className="font-medium truncate">{user.fullName}</div>
                                <div className="text-sm text-zinc-400">
                                    {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                                </div>
                            </div>
                        </button>
                    ))}

                    {filteredFriends.length === 0 && (
                        <div className="text-center text-zinc-500 py-4 text-sm hidden lg:block">
                            No friends yet. Use Find tab to add people!
                        </div>
                    )}
                </div>
            )}

            {/* SEARCH TAB */}
            {activeTab === "search" && (
                <div className="flex flex-col w-full py-3 px-3 gap-3">
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="input input-bordered input-sm w-full hidden lg:block"
                    />

                    {isSearching && (
                        <p className="text-xs text-zinc-400 text-center hidden lg:block">Searching...</p>
                    )}

                    <div className="overflow-y-auto flex flex-col gap-2">
                        {searchResults.map((user) => (
                            <div
                                key={user._id}
                                className="flex items-center gap-3 p-2 rounded-lg bg-base-200"
                            >
                                <img
                                    src={user.profilePic || "/avatar.png"}
                                    alt={user.fullName}
                                    className="size-10 rounded-full object-cover mx-auto lg:mx-0"
                                />
                                <div className="hidden lg:block flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{user.fullName}</p>
                                </div>

                                {/* Status button */}
                                {user.isFriend ? (
                                    <span className="hidden lg:flex items-center gap-1 text-xs text-green-500">
                                        <Check className="size-3" /> Friends
                                    </span>
                                ) : user.iSentRequest || user.isPending ? (
                                    <span className="hidden lg:flex items-center gap-1 btn btn-xs btn-disabled">
                                        <Clock className="size-3" /> Pending
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => sendFriendRequest(user._id)}
                                        className="hidden lg:flex btn btn-xs btn-primary gap-1"
                                    >
                                        <UserPlus className="size-3" /> Add
                                    </button>
                                )}
                            </div>
                        ))}

                        {searchQuery && !isSearching && searchResults.length === 0 && (
                            <p className="text-center text-zinc-500 text-sm hidden lg:block">
                                No users found
                            </p>
                        )}

                        {!searchQuery && (
                            <p className="text-center text-zinc-400 text-sm hidden lg:block">
                                Type a name to search
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* REQUESTS TAB */}
            {activeTab === "requests" && (
                <div className="overflow-y-auto w-full py-3 px-3">
                    
                    {pendingRequests.length > 0 ? (
                        pendingRequests.map((req) => (
                            <div
                                key={req.from._id}
                                className="flex items-center gap-3 p-2 rounded-lg bg-base-200 mb-2"
                            >
                                <img
                                    src={req.from.profilePic || "/avatar.png"}
                                    alt={req.from.fullName}
                                    className="size-10 rounded-full object-cover"
                                />

                                <div className="flex-1 min-w-0 hidden lg:block">
                                    <p className="text-sm font-medium truncate">
                                        {req.from.fullName}
                                    </p>
                                    <p className="text-xs text-zinc-400">
                                        wants to connect
                                    </p>
                                </div>

                                {/* ACCEPT */}
                                <button
                                    onClick={() => acceptFriendRequest(req.from._id)}
                                    className="btn btn-xs btn-success gap-1"
                                >
                                    Accept
                                </button>

                                {/* DECLINE */}
                                <button
                                    onClick={() => declineFriendRequest(req.from._id)}
                                    className="btn btn-xs btn-error gap-1"
                                >
                                    Decline
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-zinc-500 text-sm">
                            No pending requests
                        </p>
                    )}
                </div>
            )}
        </aside>
    );
};

export default Sidebar;