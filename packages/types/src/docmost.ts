export type PaginationMeta = {
  limit: number;
  page: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type Space = {
  id: string;
  name: string;
  description: string;
  slug: string;
  logo: string | null;
  visibility: "private";
  defaultRole: "writer";
  creatorId: string;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  memberCount: number;
};

export type Page = {
  id: string;
  slugId: string;
  title: string;
  icon: string;
  position: string;
  parentPageId: string | null;
  spaceId: string;
  hasChildren: boolean;
};

export type FindSpacesApiRequest = {
  page?: number;
  limit?: number;
};

export type FindSpacesApiResponse = {
  data: {
    items: Space[];
    meta: PaginationMeta;
  };
  success: boolean;
  status: number;
};

export type FindSpaceApiRequest = {
  spaceId: string;
};

export type FindSpaceApiResponse = {
  data: Space & {
    membership: {
      userId: string;
      role: "admin";
      permissions: Array<unknown>;
    };
  };
};

export type FindPagesApiRequest = {
  spaceId: string;
  page?: number;
};

export type FindPagesApiResponse = {
  data: {
    items: Page[];
    meta: PaginationMeta;
  };
  success: boolean;
  status: number;
};

export type ExportPageApiRequest = {
  pageId: string;
  format: "html" | "markdown";
};

export type ExportPageApiResponse = string;
