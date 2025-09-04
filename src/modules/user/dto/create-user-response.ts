export interface UserResponse {
    id: string;         
    name: string;       
    email: string;      
    code: string;       
    logo?: string;      
    role: 'client' | 'admin';
    createdAt: string;  
    updatedAt: string;  
  }
  