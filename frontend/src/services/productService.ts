import api from "./api";

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url: string | null;
  category_id: string;
  category_name: string;
  description?: string;
  created_at: string;
  updated_at?: string;
}

export interface GetAllProductsResponse {
  success: boolean;
  counts: number;
  in_stock_count?: number;
  out_of_stock_count?: number;
  page: number;
  limit: number;
  message: string;
  products: Product[];
}

export interface CreateProductRequest {
  name: string;
  price: number;
  category_id: string;
  stock: number;
  description?: string;
}

export interface UpdateProductRequest {
  name?: string;
  price?: number;
  category_id?: string;
  stock?: number;
  description?: string;
}

export interface ProductResponse {
  success: boolean;
  message: string;
  product?: Product;
}

export const productService = {
  /** GET /api/product/get_all */
  getAllProducts: async (params?: {
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: "ASC" | "DESC";
  }): Promise<GetAllProductsResponse> => {
    const { data } = await api.get<GetAllProductsResponse>("/api/product/get_all", {
      params,
    });
    return data;
  },

  /** GET /api/product/:id */
  getProductById: async (id: string): Promise<ProductResponse> => {
    const { data } = await api.get<ProductResponse>(`/api/product/${id}`);
    return data;
  },

  /** POST /api/product/create */
  createProduct: async (formData: FormData): Promise<ProductResponse> => {
    const { data } = await api.post<ProductResponse>("/api/product/create", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },

  /** PATCH /api/product/:id/update */
  updateProduct: async (id: string, formData: FormData): Promise<ProductResponse> => {
    const { data } = await api.patch<ProductResponse>(`/api/product/${id}/update`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },

  /** DELETE /api/product/:id/delete */
  deleteProduct: async (id: string): Promise<{ success: boolean; message: string }> => {
    const { data } = await api.delete<{ success: boolean; message: string }>(
      `/api/product/${id}/delete`
    );
    return data;
  },
};