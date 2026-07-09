import React, { useEffect, useState } from "react";
import { useChatStore } from "../store/UseChatStore";

const STATUS_OPTIONS = [1, 3, 5, 12, 24];

const StatusPanel = () => {
    const {
        friendStatuses,
        myStatus,
        getFriendStatuses,
        getMyStatus,
        createStatus,
        isStatusLoading,
    } = useChatStore();

    const [text, setText] = useState("");
    const [duration, setDuration] = useState(24);
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(null);

    useEffect(() => {
        getFriendStatuses();
        getMyStatus();
    }, );

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setMediaFile(reader.result);
            setMediaPreview({ url: reader.result, type: file.type.startsWith("video/") ? "video" : "image" });
        };
        reader.readAsDataURL(file);
    };

    const resetMedia = () => {
        setMediaFile(null);
        setMediaPreview(null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const statusPayload = {
            text,
            durationHours: duration,
        };

        if (mediaFile) {
            if (mediaPreview.type === "video") {
                statusPayload.video = mediaFile;
            } else {
                statusPayload.image = mediaFile;
            }
        }

        await createStatus(statusPayload);
        setText("");
        setDuration(24);
        resetMedia();
    };

    const formatRemaining = (expiresAt) => {
        const diff = new Date(expiresAt) - new Date();
        if (diff <= 0) return "Expired";
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    return (
        <div className="overflow-y-auto w-full py-3 px-3">
            <div className="space-y-4">
                <div className="bg-base-200 rounded-xl p-4">
                    <h3 className="text-sm font-semibold mb-3">Share a status</h3>
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            rows={3}
                            placeholder="What's on your mind?"
                            className="textarea textarea-bordered w-full"
                        />

                        <div className="space-y-3">
                            <label className="block text-sm text-zinc-500">Image / video</label>
                            <input
                                type="file"
                                accept="image/*,video/*"
                                onChange={handleFileChange}
                                className="file-input file-input-bordered w-full"
                            />
                            {mediaPreview && (
                                <div className="mt-3 rounded-xl overflow-hidden bg-base-300">
                                    {mediaPreview.type === "video" ? (
                                        <video src={mediaPreview.url} controls className="w-full" />
                                    ) : (
                                        <img src={mediaPreview.url} alt="preview" className="w-full object-cover" />
                                    )}
                                    <button
                                        type="button"
                                        onClick={resetMedia}
                                        className="btn btn-xs btn-warning mt-2"
                                    >
                                        Remove media
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <select
                                value={duration}
                                onChange={(e) => setDuration(Number(e.target.value))}
                                className="select select-bordered w-full sm:w-auto"
                            >
                                {STATUS_OPTIONS.map((option) => (
                                    <option key={option} value={option}>
                                        {option} hour{option > 1 ? "s" : ""}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="submit"
                                className="btn btn-primary w-full sm:w-auto"
                                disabled={isStatusLoading || !text.trim()}
                            >
                                {isStatusLoading ? "Posting..." : "Post status"}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="bg-base-200 rounded-xl p-4">
                    <h3 className="text-sm font-semibold mb-3">Your active status</h3>
                    {myStatus ? (
                        <div className="p-4 bg-base-300 rounded-xl space-y-3">
                            <p className="text-sm text-zinc-500">Posted now</p>
                            {myStatus.mediaUrl && myStatus.mediaType === "video" ? (
                                <video src={myStatus.mediaUrl} controls className="w-full rounded-xl" />
                            ) : myStatus.mediaUrl && myStatus.mediaType === "image" ? (
                                <img src={myStatus.mediaUrl} alt="status" className="w-full rounded-xl object-cover" />
                            ) : null}
                            {myStatus.text && <p className="mb-2">{myStatus.text}</p>}
                            <p className="text-xs text-zinc-400">
                                Expires in {formatRemaining(myStatus.expiresAt)}
                            </p>
                        </div>
                    ) : (
                        <p className="text-sm text-zinc-500">You have no active status.</p>
                    )}
                </div>

                <div className="bg-base-200 rounded-xl p-4">
                    <h3 className="text-sm font-semibold mb-3">Friend statuses</h3>
                    {friendStatuses.length > 0 ? (
                        <div className="space-y-3">
                            {friendStatuses.map((status) => (
                                <div key={status.statusId} className="p-3 bg-base-300 rounded-xl space-y-3">
                                    <div className="flex items-center gap-3 mb-2">
                                        <img
                                            src={status.profilePic || "/avatar.png"}
                                            alt={status.fullName}
                                            className="size-10 rounded-full object-cover"
                                        />
                                        <div>
                                            <div className="font-medium text-sm">{status.fullName}</div>
                                            <div className="text-xs text-zinc-400">
                                                Expires in {formatRemaining(status.expiresAt)}
                                            </div>
                                        </div>
                                    </div>
                                    {status.mediaUrl && status.mediaType === "video" ? (
                                        <video src={status.mediaUrl} controls className="w-full rounded-xl" />
                                    ) : status.mediaUrl && status.mediaType === "image" ? (
                                        <img src={status.mediaUrl} alt="status" className="w-full rounded-xl object-cover" />
                                    ) : null}
                                    {status.text && <p className="text-sm">{status.text}</p>}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-zinc-500">No active statuses from friends.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StatusPanel;
