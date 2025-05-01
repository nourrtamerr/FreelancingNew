export interface Chat {
    id?: number
    senderId?: string 
    senderName?: string 
    receiverId?: string
    receiverName?: string
    message?: any
    image?:File
    imageUrl?: string
    sentAt?: string
    isRead?: boolean
  }
  