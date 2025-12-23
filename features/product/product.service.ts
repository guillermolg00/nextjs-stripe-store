import { commerce } from "@/lib/commerce";
import type { Collection, Product } from "./product.types";

const getFeaturedProducts = async (limit = 6) => (await commerce.productBrowse({ limit })).data;

const getProduct = async (slugOrId: string) => commerce.productGet({ idOrSlug: slugOrId });

const getCollections = async (limit = 6) => (await commerce.collectionBrowse({ limit })).data;

const getCollection = async (slugOrId: string): Promise<Collection | null> =>
	commerce.collectionGet({ idOrSlug: slugOrId });

const searchProducts = async (query: string): Promise<Product[]> => {
	const normalized = query.toLowerCase();
	const { data } = await commerce.productBrowse({ limit: 50 });
	return data.filter((product) => product.name.toLowerCase().includes(normalized));
};

export const productService = {
	getFeaturedProducts,
	getProduct,
	getCollections,
	getCollection,
	searchProducts,
};
