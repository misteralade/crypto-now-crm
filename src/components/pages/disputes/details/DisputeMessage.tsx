import {Fragment, useEffect, useRef, useState, type ChangeEvent} from "react";
import {AlertCircle, CheckCircle, Clock, Download, FileText, Paperclip, Send, Shield, User, X} from "lucide-react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import type { AttachmentType, DisputeMessageResponse, MessageAttachment } from "../../../../types/response.payload.types.ts";
import { useUploadQuery } from "../../../../queries/upload.query.ts";
import {formatFileSize, getFileType} from "../../../../util/index.util.ts";
import { ATTACHMENT_TYPE, TIME_IN_MILLISECONDS } from "../../../../util/constants.util.ts";
import { MESSAGE_SENDER_TYPE, isDisputeClosed } from "../../../../util/dispute.constants.util.ts";
import { LoadingSpinner } from "../../../global/LoadingSpinner.tsx";
import {setDisputeAttachments, setDisputeMessageText} from "../../../../redux/dispute.slice.ts";

interface DisputeMessageProps {
  loading: boolean;
  messages: Array<DisputeMessageResponse> | null | undefined;
  sendMessageMutation: any;
  disputeId?: string;
  disputeStatus?: string | null;
}

interface UploadingFile {
  id: number;
  file: File;
  name: string;
  size: number;
  type: AttachmentType;
  mimeType: string;
  localPreview: string | null;
  isUploading: boolean;
  error?: string;
}

const DisputeMessage = ({
  loading,
  messages,
  sendMessageMutation,
  disputeId,
  disputeStatus,
}: DisputeMessageProps) => {
  const dispatch = useDispatch();
  const { uploadFileMutation } = useUploadQuery();
  
  const [message, setMessage] = useState("");
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [uploadedAttachments, setUploadedAttachments] = useState<MessageAttachment[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastActivityTimeRef = useRef<number>(Date.now());
  const initialScrollDoneRef = useRef<boolean>(false);

  const safeMessages = Array.isArray(messages) ? messages : [];
  const closed = isDisputeClosed(disputeStatus);

  // Track user activity (mouse movement, scroll, and touch events)
  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (!messagesContainer) return;

    const handleActivity = () => {
      lastActivityTimeRef.current = Date.now();
    };

    messagesContainer.addEventListener('mousemove', handleActivity, { passive: true });
    messagesContainer.addEventListener('wheel', handleActivity, { passive: true });
    messagesContainer.addEventListener('touchmove', handleActivity, { passive: true });
    messagesContainer.addEventListener('scroll', handleActivity, { passive: true });

    return () => {
      messagesContainer.removeEventListener('mousemove', handleActivity);
      messagesContainer.removeEventListener('wheel', handleActivity);
      messagesContainer.removeEventListener('touchmove', handleActivity);
      messagesContainer.removeEventListener('scroll', handleActivity);
    };
  }, []);

  // Initial scroll on message load
  useEffect(() => {
    if (safeMessages.length > 0 && !initialScrollDoneRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      initialScrollDoneRef.current = true;
    }
  }, [safeMessages.length]);

  // Auto-scroll to bottom only if user has been idle for 120 seconds
  useEffect(() => {
    if (safeMessages.length === 0) return;

    const timeSinceLastActivity = Date.now() - lastActivityTimeRef.current;
    if (timeSinceLastActivity >= TIME_IN_MILLISECONDS.TWO_MINUTES) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [safeMessages]);
  
  // Get image dimensions
  const getImageDimensions = (file: File): Promise<{ width: number; height: number } | null> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith("image/")) {
        resolve(null);
        return;
      }
      
      const img = new window.Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => {
        resolve(null);
        URL.revokeObjectURL(img.src);
      };
      img.src = URL.createObjectURL(file);
    });
  };
  
  // Get video duration
  const getVideoDuration = (file: File): Promise<number | null> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith("video/")) {
        resolve(null);
        return;
      }
      
      const video = document.createElement("video");
      video.onloadedmetadata = () => {
        resolve(video.duration);
        URL.revokeObjectURL(video.src);
      };
      video.onerror = () => {
        resolve(null);
        URL.revokeObjectURL(video.src);
      };
      video.src = URL.createObjectURL(file);
    });
  };
  
  // Handle file selection - Upload immediately
  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;
    
    // Add files to uploading state
    const newUploadingFiles: UploadingFile[] = files.map((file) => ({
      id: Date.now() + Math.random(),
      file: file,
      name: file.name,
      size: file.size,
      type: getFileType(file),
      mimeType: file.type || "application/octet-stream",
      localPreview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      isUploading: true,
    }));
    
    setUploadingFiles((prev) => [...prev, ...newUploadingFiles]);
    
    // Upload each file immediately
    for (const uploadingFile of newUploadingFiles) {
      try {
        const formData = new FormData();
        formData.append("file", uploadingFile.file);
        
        try {
          const url = await uploadFileMutation.mutateAsync(formData);
          
          // Get metadata
          const metadata: MessageAttachment["metadata"] = {};
          
          if (uploadingFile.type === ATTACHMENT_TYPE.IMAGE) {
            const dimensions = await getImageDimensions(uploadingFile.file);
            if (dimensions) {
              metadata.width = dimensions.width;
              metadata.height = dimensions.height;
            }
          } else if (uploadingFile.type === ATTACHMENT_TYPE.VIDEO) {
            const duration = await getVideoDuration(uploadingFile.file);
            if (duration) {
              metadata.duration = duration;
            }
          }
          
          // Create MessageAttachment
          const attachment: MessageAttachment = {
            url: url,
            type: uploadingFile.type,
            filename: uploadingFile.name,
            size: uploadingFile.size,
            mimeType: uploadingFile.mimeType,
            uploadedAt: new Date(),
            metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
          };
          
          // Add to uploaded attachments
          setUploadedAttachments((prev) => [...prev, attachment]);
          
          // Remove from uploading
          setUploadingFiles((prev) => prev.filter((f) => f.id !== uploadingFile.id));
          
          // Clean up local preview
          if (uploadingFile.localPreview) {
            URL.revokeObjectURL(uploadingFile.localPreview);
          }
        } catch (error) {
          throw error;
        }
      } catch (error) {
        console.error("Upload failed:", error);
        
        // Update uploading file with error
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.id === uploadingFile.id
              ? { ...f, isUploading: false, error: "Upload failed" }
              : f
          )
        );
      }
    }
    
    // Reset input
    event.target.value = "";
  };
  
  // Remove uploading file
  const removeUploadingFile = (fileId: number): void => {
    const file = uploadingFiles.find((f) => f.id === fileId);
    if (file?.localPreview) {
      URL.revokeObjectURL(file.localPreview);
    }
    setUploadingFiles((prev) => prev.filter((f) => f.id !== fileId));
  };
  
  // Remove uploaded attachment
  const removeAttachment = (url: string): void => {
    setUploadedAttachments((prev) => prev.filter((a) => a.url !== url));
  };
  
  // Send message
  const handleSendMessage = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage && uploadedAttachments.length === 0) {
      toast.error("Please enter a message or attach a file");
      return;
    }
    
    // Check if any files are still uploading
    if (uploadingFiles.length > 0) {
      toast.warning("Please wait for all files to finish uploading");
      return;
    }
    
    try {
      // Set message and attachments in Redux
      dispatch(setDisputeMessageText(trimmedMessage));
      dispatch(setDisputeAttachments(uploadedAttachments));
      
      // Send message directly with payload
      await sendMessageMutation.mutateAsync({
        disputeId,
        message: trimmedMessage,
        attachments: uploadedAttachments,
      });
      
      // Clear form after successful send
      setMessage("");
      setUploadedAttachments([]);
      setUploadingFiles([]);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };
  
  return (
    <Fragment>
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <LoadingSpinner size="lg" message="Loading messages..." />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[650px] max-h-[calc(100vh-220px)] min-h-[500px]">
          {/* Chat Header */}
          <div className="border-b border-gray-200 px-5 py-4 flex items-center justify-between bg-gray-50/60 rounded-t-xl">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Dispute Conversation
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Live thread with the customer regarding this dispute
              </p>
            </div>
            {closed && (
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                Dispute Closed
              </span>
            )}
          </div>
          
          {/* Messages */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {safeMessages.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <p className="text-sm font-medium text-gray-700">No messages yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Send a reply below to communicate with the user
                </p>
              </div>
            ) : (
              safeMessages.map((msg: DisputeMessageResponse) => {
                const isAdmin = msg.senderType === MESSAGE_SENDER_TYPE.ADMIN;

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${isAdmin ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        isAdmin
                          ? "bg-[#E6E6FE] text-[#03034D]"
                          : "bg-gray-100 text-gray-600 border border-gray-200"
                      }`}
                    >
                      {isAdmin ? (
                        <Shield className="w-4 h-4" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>
                    
                    {/* Message Content */}
                    <div
                      className={`flex-1 max-w-[80%] ${
                        isAdmin ? "items-end" : "items-start"
                      } flex flex-col`}
                    >
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <p
                          className={`text-xs font-semibold ${
                            isAdmin ? "text-[#03034D]" : "text-gray-700"
                          }`}
                        >
                          {isAdmin ? "Support (You)" : msg.email ? `User (${msg.email})` : "Customer"}
                        </p>
                        <span className="text-2xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(msg.createdAt).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      
                      {msg.messageText && (
                        <div
                          className={`rounded-2xl px-4 py-2.5 shadow-sm text-sm whitespace-pre-wrap leading-relaxed ${
                            isAdmin
                              ? "bg-[#03034D] text-white rounded-tr-none"
                              : "bg-gray-100 text-gray-900 border border-gray-200 rounded-tl-none"
                          }`}
                        >
                          {msg.messageText}
                        </div>
                      )}
                      
                      {/* Message Attachments */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-2 space-y-2 w-full max-w-sm">
                          {msg.attachments.map((attachment, index) => (
                            <a
                              key={index}
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center gap-3 p-2.5 rounded-xl transition-all border ${
                                isAdmin
                                  ? "bg-gray-50 hover:bg-gray-100 text-gray-900 border-gray-200"
                                  : "bg-white hover:bg-gray-50 text-gray-900 border-gray-200 shadow-sm"
                              }`}
                            >
                              {attachment.type === ATTACHMENT_TYPE.IMAGE ? (
                                <img
                                  src={attachment.url}
                                  alt={attachment.filename}
                                  className="w-10 h-10 object-cover rounded-lg shrink-0 border border-gray-200"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                  <FileText className="w-5 h-5 text-gray-500" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-900 truncate">
                                  {attachment.filename}
                                </p>
                                <p className="text-2xs text-gray-500">
                                  {formatFileSize(attachment.size)}
                                </p>
                              </div>
                              <Download className="w-4 h-4 text-gray-400 shrink-0" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Message Input */}
          <div className="border-t border-gray-200 p-4 bg-gray-50/50 rounded-b-xl">
            {/* Files Preview - Both Uploading and Uploaded */}
            {(uploadingFiles.length > 0 || uploadedAttachments.length > 0) && (
              <div className="mb-3 space-y-2">
                <p className="text-xs font-semibold text-gray-700">
                  Attachments ({uploadingFiles.length + uploadedAttachments.length})
                  {uploadingFiles.length > 0 && (
                    <span className="text-blue-600 font-normal ml-2">
                      ({uploadingFiles.length} uploading...)
                    </span>
                  )}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {/* Uploading Files */}
                  {uploadingFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5 border border-gray-200 text-xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-gray-700 max-w-[140px] truncate">
                        {file.name}
                      </span>
                      {file.isUploading && (
                        <div className="w-3.5 h-3.5 border-2 border-[#03034D] border-t-transparent rounded-full animate-spin" />
                      )}
                      {file.error && (
                        <span className="text-red-600 font-medium">{file.error}</span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeUploadingFile(file.id)}
                        disabled={file.isUploading}
                        className="text-gray-400 hover:text-red-600 disabled:opacity-50"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  
                  {/* Uploaded Attachments */}
                  {uploadedAttachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-green-50 rounded-lg px-3 py-1.5 border border-green-200 text-xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-green-700" />
                      <span className="text-green-900 max-w-[140px] truncate font-medium">
                        {attachment.filename}
                      </span>
                      <CheckCircle className="w-3.5 h-3.5 text-green-600 shrink-0" />
                      <button
                        type="button"
                        onClick={() => removeAttachment(attachment.url)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Input Area */}
            <div className="flex items-end gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
              />
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200/70 rounded-xl transition-colors cursor-pointer shrink-0"
                disabled={sendMessageMutation.isPending}
                title="Attach files"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type reply to customer..."
                rows={2}
                className="flex-1 px-3.5 py-2 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#03034D] focus:border-transparent resize-none leading-relaxed"
                disabled={sendMessageMutation.isPending}
              />
              
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={
                  sendMessageMutation.isPending ||
                  (!message.trim() && uploadedAttachments.length === 0) ||
                  uploadingFiles.length > 0
                }
                className="px-4 py-2.5 bg-[#03034D] text-white rounded-xl hover:bg-[#050568] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shrink-0 text-sm font-medium shadow-sm"
              >
                {sendMessageMutation.isPending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Fragment>
                    <span>Reply</span>
                    <Send className="w-4 h-4" />
                  </Fragment>
                )}
              </button>
            </div>
            
            <p className="text-2xs text-gray-500 mt-2 px-1">
              Press Enter to send, Shift+Enter for a new line.
              {uploadingFiles.length > 0 && (
                <span className="text-blue-600 ml-2 font-medium">Files uploading...</span>
              )}
            </p>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default DisputeMessage;
