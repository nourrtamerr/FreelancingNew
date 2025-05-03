// const BannDate = new Date().toISOString();
export interface Ban {
    id?: number
    description: string
    banDate: Date
    banEndDate: Date
    bannedUserId: string
    bannedUserName?: string
  }
