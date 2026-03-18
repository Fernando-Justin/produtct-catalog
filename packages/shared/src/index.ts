export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: { id: string; name: string; type: string };
  squad?: { id: string; name: string };
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Squad {
  id: string;
  name: string;
  description?: string;
  status: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  purpose?: string;
  observations?: string;
  confluenceUrl?: string;
  status: 'HOMOLOGACAO' | 'PRODUCAO' | 'DESCONTINUADO';
  squad?: Squad;
  squadId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapItem {
  id: string;
  productId: string;
  title: string;
  description?: string;
  goalIndicator?: string;
  plannedDate?: string;
  effort: 'PP' | 'P' | 'M' | 'G' | 'GG';
  status: 'BACKLOG' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE';
  assigneeId?: string;
  assignee?: User;
  identifier?: string;
}
