import api from "./api";

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url: string | null;
  category_id: string;
  category_name: string;
  created_at: string;
}

export interface GetAllProductsResponse {
  success: boolean;
  counts: number;
  page: number;
  limit: number;
  message: string;
  products: Product[];
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
};
