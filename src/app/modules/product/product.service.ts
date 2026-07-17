/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import mongoose, { Model, Types } from "mongoose";
import slugify from "slugify";
import cloudinary from "../../config/cloudinary";
import AppError from "../../errorHelpers/appError";
import { QueryBuilder } from "../../utils/queryBuilder";
import { Brand } from "../brand/brand.model";
import { Categories } from "../categories/categories.model";
import { Section } from "../section/section.model";
import { Type } from "../type/type.model";
import { getPublicIdFromUrl } from "../upload/upload.utils";
import { IProduct, IProductCSVRow, IProductInput } from "./product.interface";
import { Product } from "./product.model";

const resolveRefByName = async (
  model: Model<any>,
  name: string,
  session?: any,
): Promise<Types.ObjectId> => {
  const trimmedName = name.trim();

  const query = model.findOne({
    name: { $regex: `^${trimmedName}$`, $options: "i" },
  });
  const existing = session ? await query.session(session) : await query;

  if (existing) {
    return existing._id as Types.ObjectId;
  }

  const createOptions = session ? { session } : {};
  const created = await model.create(
    [
      {
        name: trimmedName,
        slug: slugify(trimmedName, {
          lower: true,
          strict: true,
          trim: true,
        }),
      },
    ],
    createOptions,
  );

  return created[0]._id as Types.ObjectId;
};

const resolveCategoryIds = async (
  categoryNames: string[],
  session?: any,
): Promise<Types.ObjectId[]> => {
  const cleanedNames = categoryNames.map((name) => name.trim()).filter(Boolean);
  if (!cleanedNames.length) return [];

  const ids: Types.ObjectId[] = [];

  for (const name of cleanedNames) {
    const id = await resolveRefByName(Categories, name, session);
    ids.push(id);
  }

  return ids;
};

const resolveProductRefs = async (
  payload: Partial<IProductInput> | IProductCSVRow,
  session?: any,
  categories?: string[],
) => {
  const resolved: Partial<IProduct> = {};

  if (payload.brand) {
    resolved.brand = await resolveRefByName(Brand, payload.brand, session);
  }

  if (payload.section) {
    resolved.section = await resolveRefByName(
      Section,
      payload.section,
      session,
    );
  }

  if (payload.type) {
    resolved.type = await resolveRefByName(Type, payload.type, session);
  }

  if (categories && categories.length) {
    resolved.categories = await resolveCategoryIds(categories, session);
  }

  return resolved;
};

const createProductService = async (
  payload: IProductInput & { photo?: string[] },
) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const resolvedRefs = await resolveProductRefs(
      payload,
      session,
      payload.categories,
    );

    const product = await Product.create(
      [
        {
          name: payload.name,
          description: payload.description,
          price: payload.price,
          photo: payload.photo,
          ...resolvedRefs,
        },
      ],
      { session },
    );

    await session.commitTransaction();
    return product[0];
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    session.endSession();
  }
};

const CATEGORY_DELIMITER = "|";

const createProductsFromCSVService = async (rows: IProductCSVRow[]) => {
  if (!rows.length) {
    throw new AppError(httpStatus.BAD_REQUEST, "CSV file has no rows!");
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const createdProducts = [];

    for (const [index, row] of rows.entries()) {
      if (!row.name || !row.name.trim()) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `Row ${index + 1}: "name" is required!`,
        );
      }

      const categoryNames = row.categories
        ? row.categories
            .split(CATEGORY_DELIMITER)
            .map((c) => c.trim())
            .filter(Boolean)
        : [];

      const resolvedRefs = await resolveProductRefs(
        row,
        session,
        categoryNames,
      );

      // FIX: Saves description and price from the CSV row!
      const product = await Product.create(
        [
          {
            name: row.name.trim(),
            description: row.description,
            price: row.price,
            ...resolvedRefs,
          },
        ],
        { session },
      );

      createdProducts.push(product[0]);
    }

    await session.commitTransaction();

    return createdProducts;
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    session.endSession();
  }
};

const getAllProductsService = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(
    Product.find().populate("brand section type categories"),
    query,
  );

  const products = queryBuilder.search(["name"]).sort().fields().paginate();

  const [data, meta] = await Promise.all([
    products.build(),
    products.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

const getSingleProductService = async (id: string) => {
  const product = await Product.findById(id).populate(
    "brand section type categories",
  );

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found!");
  }

  return product;
};

const updateProductService = async (
  id: string,
  payload: Partial<IProductInput> & { photo?: string },
) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found!");
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // 1. Resolve referencing ObjectIds if name schemas changed
    const resolvedRefs = await resolveProductRefs(
      payload,
      session,
      payload.categories,
    );

    // 2. Perform the database update operation inside the transaction context
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        ...(payload.name && { name: payload.name }),
        ...(payload.description && { description: payload.description }),
        ...(payload.price && { price: payload.price }),
        ...(payload.photo !== undefined && { photo: payload.photo }),
        ...resolvedRefs,
      },
      { new: true, runValidators: true, session },
    );

    if (payload.photo && product.photo && product.photo !== payload.photo) {
      const oldPublicId = getPublicIdFromUrl(product.photo);

      if (oldPublicId) {
        try {
          await cloudinary.uploader.destroy(oldPublicId);
        } catch (cloudinaryError) {
          console.error(
            "Failed deleting legacy image from Cloudinary storage:",
            cloudinaryError,
          );
        }
      }
    }

    await session.commitTransaction();
    return updatedProduct;
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    session.endSession();
  }
};

const deleteProductService = async (id: string) => {
  const product = await Product.findById(id);

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found!");
  }

  await Product.findByIdAndDelete(id);

  return null;
};

export const ProductServices = {
  createProductService,
  createProductsFromCSVService,
  getAllProductsService,
  getSingleProductService,
  updateProductService,
  deleteProductService,
};
