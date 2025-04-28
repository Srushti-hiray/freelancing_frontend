export interface User {
    id: number;
    name: string;
    email: string;
    bio?: string;
    skills?: string[];
    profileImage?: string;
    profile_Image?: string;
    role: 'client' | 'freelancer';
  }
  
  export interface Project {
    id: number;
    title: string;
    category: string;
    description: string;
    budget: number;
    deadline: string;
    clientId: number;
    client?: {
      id: number;
      name: string;
      email: string;
      bio?: string;
      skills?: string[];
      profileImage?: string;
      role: 'client' | 'freelancer';
    };
    freelancerId?: number;
    freelancer?: {
      id: number;
      name: string;
      email: string;
      bio?: string;
      skills?: string[];
      profileImage?: string;
      role: 'client' | 'freelancer';
    };
  }
  
  export interface Bid {
    id: number;
    projectId: number;
    freelancerId: number;
    amount: number;
    duration: number;
    message: string;
    freelancer?: {
      id: number;
      name: string;
    };
  }
  
  export interface Message {
    id: number;
    projectId: number;
    senderId: number;
    receiverId: number;
    content: string;
    createdAt: string;
  }
  
  export interface ProjectFile {
    id: number;
    projectId: number;
    userId: number;
    filePath: string;
    fileType: string;
    uploadedAt: string;
  }
  
  export interface Milestone {
    id: number;
    projectId: number;
    title: string;
    dueDate: string;
    amount: number;
    status: 'pending' | 'completed' | 'paid';
  }
  
  export interface Invoice {
    id: number;
    milestoneId: number;
    amount: number;
    status: 'pending' | 'paid';
    createdAt: string;
    milestone?: {
      id: number;
      title: string;
    };
  }
  
  export interface Skill {
    id: number;
    name: string;
  }