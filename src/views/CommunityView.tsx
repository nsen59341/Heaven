import React, { useState, useRef } from "react";
import {
  Image as ImageIcon,
  Send,
  Heart,
  X,
  Trophy,
  Flame,
  Sparkles,
  Maximize2,
  MessageSquare,
  CornerDownRight,
  Reply,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { Post, PostComment, User } from "../types";

export const CommunityView: React.FC = () => {
  const { currentUser, state, addPost, toggleReaction, addComment, toggleCommentReaction } = useApp();
  const [postText, setPostText] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [activeLightboxImg, setActiveLightboxImg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"feed" | "leaderboard">("feed");

  // Comment input state per post: { [postId]: string }
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  // Reply target per post: { [postId]: { commentId: string; authorName: string } | null }
  const [replyTargets, setReplyTargets] = useState<{
    [postId: string]: { commentId: string; authorName: string } | null;
  }>({});
  // Expanded comments section per post: default open or toggled
  const [expandedComments, setExpandedComments] = useState<{ [postId: string]: boolean }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleCommentsForPost = (postId: string) => {
    setExpandedComments((prev) => ({
      ...prev,
      [postId]: prev[postId] === undefined ? false : !prev[postId],
    }));
  };

  const handleCommentSubmit = async (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    const parentId = replyTargets[postId]?.commentId;
    await addComment(postId, text, parentId);

    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    setReplyTargets((prev) => ({ ...prev, [postId]: null }));
    setExpandedComments((prev) => ({ ...prev, [postId]: true }));
  };

  // Compress image on client via HTML Canvas
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;

          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.82));
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).slice(0, 4 - selectedImages.length);
    for (const file of files) {
      try {
        const compressed = await compressImage(file);
        setSelectedImages((prev) => [...prev, compressed].slice(0, 4));
      } catch (err) {
        console.error("Compression error:", err);
      }
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    if (e.clipboardData.files.length > 0) {
      const file = e.clipboardData.files[0];
      if (file.type.startsWith("image/") && selectedImages.length < 4) {
        try {
          const compressed = await compressImage(file);
          setSelectedImages((prev) => [...prev, compressed].slice(0, 4));
        } catch (err) {
          console.error(err);
        }
      }
    }
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() && selectedImages.length === 0) return;
    if (isPosting) return;

    setIsPosting(true);
    try {
      await addPost(postText, selectedImages);
      setPostText("");
      setSelectedImages([]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPosting(false);
    }
  };

  // Sort members by totalPoints for monthly leaderboard
  const sortedMembers = [...state.users]
    .filter((u) => u.role !== "coach")
    .sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Sub-tab Switcher: Feed / Leaderboard */}
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("feed")}
            className={`py-2 px-4 rounded-xl text-sm font-medium transition-all ${
              activeTab === "feed"
                ? "bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            Community Reflections
          </button>
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`py-2 px-4 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "leaderboard"
                ? "bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            <Trophy className="w-4 h-4 text-[var(--highlight)]" />
            <span>Leaderboard</span>
          </button>
        </div>

        <span className="text-xs text-[var(--muted)] hidden sm:inline">
          {state.posts.length} reflections shared
        </span>
      </div>

      {/* VIEW 1: FEED */}
      {activeTab === "feed" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Post Composer Card */}
          <form
            onSubmit={handleSubmitPost}
            onPaste={handlePaste}
            className="p-5 rounded-[22px] bg-[var(--surface)] border border-[var(--border)] shadow-[var(--card-shadow)] space-y-4"
          >
            <div className="flex items-start gap-3">
              <img
                src={currentUser.photo}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full object-cover border border-[var(--border)] shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <textarea
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  placeholder="What did you discover today? Share a moment of pause or clarity..."
                  rows={3}
                  className="w-full bg-transparent text-[var(--text)] placeholder-[var(--subtle)] text-[15px] resize-none focus:outline-hidden"
                />
              </div>
            </div>

            {/* Thumbnail previews (up to 4) */}
            {selectedImages.length > 0 && (
              <div className="grid grid-cols-4 gap-2 pt-2">
                {selectedImages.map((img, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden aspect-square border border-[var(--border)] group">
                    <img src={img} alt="Upload preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedImages((prev) => prev.filter((_, idx) => idx !== i))
                      }
                      aria-label="Remove image"
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Composer toolbar */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={selectedImages.length >= 4}
                  className="p-2 rounded-xl text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--subtle-surface)] transition-colors flex items-center gap-1.5 text-xs font-medium disabled:opacity-40"
                >
                  <ImageIcon className="w-4 h-4 text-[var(--accent)]" />
                  <span>Add Photo ({selectedImages.length}/4)</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={(!postText.trim() && selectedImages.length === 0) || isPosting}
                className="py-2 px-5 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--accent-hover)] disabled:opacity-40 transition-colors flex items-center gap-1.5"
              >
                <span>{isPosting ? "Posting..." : "Share"}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Posts Feed list */}
          <div className="space-y-4">
            {state.posts.map((post) => {
              const hasReacted = post.reactions.includes(currentUser.id);
              const isAuthor = post.userId === currentUser.id;

              return (
                <article
                  key={post.id}
                  className="p-5 rounded-[22px] bg-[var(--surface)] border border-[var(--border)] shadow-[var(--card-shadow)] space-y-3.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={post.userPhoto}
                        alt={post.userName}
                        className="w-10 h-10 rounded-full object-cover border border-[var(--border)]"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="text-sm font-medium text-[var(--text)] flex items-center gap-1.5">
                          <span>{post.userName}</span>
                          {isAuthor && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--accent-light)] text-[var(--accent)] font-semibold">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[var(--muted)]">
                          {new Date(post.createdAt).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-[15px] text-[var(--text)] leading-relaxed whitespace-pre-wrap">
                    {post.text}
                  </p>

                  {/* Post Images Grid (1, 2, 3, or 4 images) */}
                  {post.images && post.images.length > 0 && (
                    <div
                      className={`grid gap-2 rounded-2xl overflow-hidden ${
                        post.images.length === 1
                          ? "grid-cols-1"
                          : post.images.length === 2
                          ? "grid-cols-2"
                          : "grid-cols-2 sm:grid-cols-3"
                      }`}
                    >
                      {post.images.map((img, i) => (
                        <div
                          key={i}
                          onClick={() => setActiveLightboxImg(img)}
                          className="relative aspect-video sm:aspect-square overflow-hidden cursor-pointer group bg-black/5"
                        >
                          <img
                            src={img}
                            alt="Post attachment"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Maximize2 className="w-5 h-5" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions Bar: Resonate & Comments */}
                  <div className="pt-2.5 border-t border-[var(--border)] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleReaction(post.id)}
                        className={`py-1.5 px-3 rounded-full border text-xs font-medium transition-all flex items-center gap-1.5 ${
                          hasReacted
                            ? "bg-[var(--highlight-light)] border-[var(--highlight)] text-[var(--highlight)] shadow-xs"
                            : "bg-[var(--subtle-surface)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
                        }`}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            hasReacted ? "fill-current" : ""
                          }`}
                        />
                        <span>
                          {post.reactions.length > 0
                            ? `${post.reactions.length} Resonated`
                            : "Resonate"}
                        </span>
                      </button>

                      {/* Comment toggle button */}
                      {(() => {
                        const postComments = (state.comments || []).filter((c) => c.postId === post.id);
                        const isExpanded = expandedComments[post.id] !== false; // open by default if has comments, or togglable
                        return (
                          <button
                            onClick={() => toggleCommentsForPost(post.id)}
                            className={`py-1.5 px-3 rounded-full border text-xs font-medium transition-all flex items-center gap-1.5 ${
                              isExpanded
                                ? "bg-[var(--accent-light)] border-[var(--accent)] text-[var(--accent)]"
                                : "bg-[var(--subtle-surface)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
                            }`}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>
                              {postComments.length > 0
                                ? `${postComments.length} ${postComments.length === 1 ? "Comment" : "Comments"}`
                                : "Comment"}
                            </span>
                          </button>
                        );
                      })()}
                    </div>

                    <span className="text-[11px] text-[var(--subtle)] hidden sm:inline">
                      Saathi Reflection
                    </span>
                  </div>

                  {/* COMMENTS & THREADED REPLIES SECTION */}
                  {(() => {
                    const postComments = (state.comments || []).filter((c) => c.postId === post.id);
                    const isExpanded = expandedComments[post.id] !== false;
                    if (!isExpanded && postComments.length === 0) return null;

                    const rootComments = postComments.filter((c) => !c.parentId);
                    const replyMap = postComments.filter((c) => !!c.parentId).reduce((acc, c) => {
                      const pid = c.parentId!;
                      if (!acc[pid]) acc[pid] = [];
                      acc[pid].push(c);
                      return acc;
                    }, {} as { [parentId: string]: PostComment[] });

                    return (
                      <div className="pt-3 border-t border-[var(--border)]/70 space-y-3">
                        {/* List of comments */}
                        {rootComments.length > 0 && (
                          <div className="space-y-2.5">
                            {rootComments.map((comment) => {
                              const hasLikedComment = (comment.reactions || []).includes(currentUser.id);
                              const replies = replyMap[comment.id] || [];

                              return (
                                <div key={comment.id} className="space-y-2">
                                  {/* Root comment */}
                                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/70 dark:border-stone-800 space-y-1.5">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <img
                                          src={comment.userPhoto}
                                          alt={comment.userName}
                                          className="w-6 h-6 rounded-full object-cover border border-stone-200 dark:border-stone-700"
                                          referrerPolicy="no-referrer"
                                        />
                                        <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                                          {comment.userName}
                                        </span>
                                        {(comment.userId === "user_coach_pooja" || comment.userId === "user_coach_asha" || comment.userName.includes("Asha")) && (
                                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-accent/15 text-accent font-semibold">
                                            Coach
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[10px] text-stone-400">
                                        {new Date(comment.createdAt).toLocaleDateString("en-IN", {
                                          month: "short",
                                          day: "numeric",
                                        })}
                                      </span>
                                    </div>

                                    <p className="text-xs text-stone-800 dark:text-stone-200 leading-relaxed pl-8">
                                      {comment.text}
                                    </p>

                                    {/* Comment Action Bar */}
                                    <div className="flex items-center gap-3 pl-8 pt-1 text-[11px]">
                                      <button
                                        type="button"
                                        onClick={() => toggleCommentReaction(comment.id)}
                                        className={`flex items-center gap-1 font-medium transition-colors ${
                                          hasLikedComment
                                            ? "text-rose-500 font-semibold"
                                            : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                                        }`}
                                      >
                                        <Heart className={`w-3 h-3 ${hasLikedComment ? "fill-current" : ""}`} />
                                        <span>{(comment.reactions || []).length > 0 ? (comment.reactions || []).length : "Like"}</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          setReplyTargets((prev) => ({
                                            ...prev,
                                            [post.id]: { commentId: comment.id, authorName: comment.userName },
                                          }));
                                          setExpandedComments((prev) => ({ ...prev, [post.id]: true }));
                                        }}
                                        className="flex items-center gap-1 text-stone-500 hover:text-accent font-medium transition-colors"
                                      >
                                        <Reply className="w-3 h-3" />
                                        <span>Reply</span>
                                      </button>
                                    </div>
                                  </div>

                                  {/* Threaded Replies */}
                                  {replies.length > 0 && (
                                    <div className="pl-6 space-y-2">
                                      {replies.map((reply) => {
                                        const hasLikedReply = (reply.reactions || []).includes(currentUser.id);
                                        return (
                                          <div
                                            key={reply.id}
                                            className="p-2.5 rounded-xl bg-stone-100/70 dark:bg-stone-900/90 border border-stone-200 dark:border-stone-800 space-y-1"
                                          >
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center gap-2">
                                                <CornerDownRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                                <img
                                                  src={reply.userPhoto}
                                                  alt={reply.userName}
                                                  className="w-5 h-5 rounded-full object-cover"
                                                  referrerPolicy="no-referrer"
                                                />
                                                <span className="text-xs font-medium text-stone-900 dark:text-stone-100">
                                                  {reply.userName}
                                                </span>
                                                {(reply.userId === "user_coach_pooja" || reply.userId === "user_coach_asha" || reply.userName.includes("Asha")) && (
                                                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-accent/15 text-accent font-semibold">
                                                    Coach
                                                  </span>
                                                )}
                                              </div>
                                              <span className="text-[10px] text-stone-400">
                                                {new Date(reply.createdAt).toLocaleDateString("en-IN", {
                                                  month: "short",
                                                  day: "numeric",
                                                })}
                                              </span>
                                            </div>

                                            <p className="text-xs text-stone-800 dark:text-stone-200 leading-relaxed pl-7">
                                              {reply.text}
                                            </p>

                                            <div className="flex items-center gap-3 pl-7 pt-0.5 text-[11px]">
                                              <button
                                                type="button"
                                                onClick={() => toggleCommentReaction(reply.id)}
                                                className={`flex items-center gap-1 font-medium transition-colors ${
                                                  hasLikedReply
                                                    ? "text-rose-500 font-semibold"
                                                    : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                                                }`}
                                              >
                                                <Heart className={`w-3 h-3 ${hasLikedReply ? "fill-current" : ""}`} />
                                                <span>{(reply.reactions || []).length > 0 ? (reply.reactions || []).length : "Like"}</span>
                                              </button>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Comment Input Composer */}
                        <form onSubmit={(e) => handleCommentSubmit(post.id, e)} className="space-y-1.5 pt-1">
                          {replyTargets[post.id] && (
                            <div className="flex items-center justify-between px-2.5 py-1 bg-accent/10 rounded-lg text-xs text-accent">
                              <span>Replying to <strong>{replyTargets[post.id]?.authorName}</strong></span>
                              <button
                                type="button"
                                onClick={() => setReplyTargets((prev) => ({ ...prev, [post.id]: null }))}
                                className="text-stone-400 hover:text-stone-700"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <img
                              src={currentUser.photo}
                              alt={currentUser.name}
                              className="w-7 h-7 rounded-full object-cover shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <input
                              type="text"
                              value={commentInputs[post.id] || ""}
                              onChange={(e) =>
                                setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                              }
                              placeholder={
                                replyTargets[post.id]
                                  ? `Reply to ${replyTargets[post.id]?.authorName}...`
                                  : "Write a supportive comment..."
                              }
                              className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-1 focus:ring-accent text-stone-900 dark:text-stone-100"
                            />
                            <button
                              type="submit"
                              disabled={!(commentInputs[post.id]?.trim())}
                              className="p-1.5 rounded-lg bg-accent text-white hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </form>
                      </div>
                    );
                  })()}
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: MONTHLY LEADERBOARD */}
      {activeTab === "leaderboard" && (
        <div className="p-5 rounded-[22px] bg-[var(--surface)] border border-[var(--border)] shadow-[var(--card-shadow)] space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div>
              <h3 className="font-serif text-lg text-[var(--text)]">
                Community Milestone Board
              </h3>
              <p className="text-xs text-[var(--muted)]">
                Points awarded for consistency, reflections, and grounding pauses.
              </p>
            </div>
            <Sparkles className="w-5 h-5 text-[var(--highlight)]" />
          </div>

          <div className="space-y-2">
            {sortedMembers.map((member, index) => {
              const isCurrent = member.id === currentUser.id;
              const rank = index + 1;

              return (
                <div
                  key={member.id}
                  className={`flex items-center gap-3.5 p-3.5 rounded-xl border transition-all ${
                    isCurrent
                      ? "border-[var(--accent)] bg-[var(--accent-light)] shadow-xs"
                      : "border-[var(--border)] bg-[var(--subtle-surface)]/50"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                      rank === 1
                        ? "bg-amber-400 text-amber-950"
                        : rank === 2
                        ? "bg-slate-300 text-slate-800"
                        : rank === 3
                        ? "bg-amber-600 text-white"
                        : "text-[var(--muted)]"
                    }`}
                  >
                    {rank}
                  </div>

                  <img
                    src={member.photo}
                    alt={member.name}
                    className="w-10 h-10 rounded-full object-cover border border-[var(--border)]"
                    referrerPolicy="no-referrer"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[var(--text)] truncate flex items-center gap-1.5">
                      <span>{member.name}</span>
                      {isCurrent && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--accent)] text-white font-semibold">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[var(--muted)] flex items-center gap-2">
                      <span className="flex items-center gap-0.5 text-[var(--highlight)]">
                        <Flame className="w-3 h-3" /> {member.currentStreak}d streak
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-serif font-bold text-[var(--accent)] tnum">
                      {member.totalPoints} pts
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {activeLightboxImg && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          onClick={() => setActiveLightboxImg(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs cursor-pointer"
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            <img
              src={activeLightboxImg}
              alt="Expanded preview"
              className="w-full h-full object-contain rounded-2xl shadow-2xl"
            />
            <button
              onClick={() => setActiveLightboxImg(null)}
              aria-label="Close image preview"
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
