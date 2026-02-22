import api from "./api";

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at?: string;
  product_count?: number;
}

export interface GetAllCategoriesResponse {
  success: boolean;
  counts: number;
  message: string;
  categories: Category[];
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
}

export interface CategoryResponse {
  success: boolean;
  message: string;
  category?: Category;
}

export const categoryService = {
  /** GET /api/category/get_all */
  getAllCategories: async (params?: {
    search?: string;
    limitTo?: number;
    offsetTo?: number;
    sortBy?: string;
  }): Promise<GetAllCategoriesResponse> => {
    const { data } = await api.get<GetAllCategoriesResponse>("/api/category/get_all", {
      params,
    });
    return data;
  },

  /** GET /api/category/:id */
  getCategoryById: async (id: string): Promise<CategoryResponse> => {
    const { data } = await api.get<CategoryResponse>(`/api/category/${id}`);
    return data;
  },

  /** POST /api/category/create */
  createCategory: async (payload: CreateCategoryRequest): Promise<CategoryResponse> => {
    const { data } = await api.post<CategoryResponse>("/api/category/create", payload);
    return data;
  },

  /** PATCH /api/category/:id/update */
  updateCategory: async (id: string, payload: UpdateCategoryRequest): Promise<CategoryResponse> => {
    const { data } = await api.patch<CategoryResponse>(`/api/category/${id}/update`, payload);
    return data;
  },

  /** DELETE /api/category/:id/delete */
  deleteCategory: async (id: string): Promise<{ success: boolean; message: string }> => {
    const { data } = await api.delete<{ success: boolean; message: string }>(
      `/api/category/${id}/delete`
    );
    return data;
  },
};
