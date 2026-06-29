/* eslint-disable @typescript-eslint/no-explicit-any */
import slugify from 'slugify';
import httpStatus from "http-status-codes";
import mongoose, { ClientSession, Model, Types } from "mongoose";
import AppError from "../../errorHelpers/appError";
import { QueryBuilder } from "../../utils/queryBuilder";
import { Brand } from "../brand/brand.model";
import { Categories } from "../categories/categories.model";
import { Section } from "../section/section.model";
import { Type } from "../type/type.model";
import { IProduct, IProductCSVRow, IProductInput } from "./product.interface";
import { Product } from "./product.model";

const resolveRefByName = async (
  model: Model<any>,
  name: string,
  session: ClientSession,
): Promise<Types.ObjectId> => {
  const trimmedName = name.trim();

  const existing = await model
    .findOne({ name: { $regex: `^${trimmedName}$`, $options: "i" } })
    .session(session);

  if (existing) {
    return existing._id;
  }

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
  { session }
);

  return created[0]._id;
};

const resolveCategoryIds = async (
  categoryNames: string[],
  session: ClientSession,
): Promise<Types.ObjectId[]> => {
  const ids: Types.ObjectId[] = [];

  for (const rawName of categoryNames) {
    const name = rawName.trim();

    if (!name) continue;

    const id = await resolveRefByName(Categories, name, session);
    ids.push(id);
  }

  return ids;
};

const resolveProductRefs = async (
  payload: Partial<IProductInput> | IProductCSVRow,
  session: ClientSession,
  categories?: string[],
) => {
  const resolved: Partial<IProduct> = {};

  if (payload.brand) {
    resolved.brand = await resolveRefByName(Brand, payload.brand, session);
  }

  if (payload.section) {
    resolved.section = await resolveRefByName(Section, payload.section, session);
  }

  if (payload.type) {
    resolved.type = await resolveRefByName(Type, payload.type, session);
  }

  if (categories && categories.length) {
    resolved.categories = await resolveCategoryIds(categories, session);
  }

  return resolved;
};

const createProductService = async (payload: IProductInput) => {
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
          ...resolvedRefs,
        },
      ],
      { session },
    );

    await session.commitTransaction();

    return product[0];
  } catch (error) {
    await session.abortTransaction();
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

      const resolvedRefs = await resolveProductRefs(row, session, categoryNames);

      const product = await Product.create(
        [
          {
            name: row.name.trim(),
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
    await session.abortTransaction();
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
  payload: Partial<IProductInput>,
) => {
  const product = await Product.findById(id);

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found!");
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const resolvedRefs = await resolveProductRefs(
      payload,
      session,
      payload.categories,
    );

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        ...(payload.name && { name: payload.name }),
        ...resolvedRefs,
      },
      { new: true, runValidators: true, session },
    );

    await session.commitTransaction();

    return updatedProduct;
  } catch (error) {
    await session.abortTransaction();
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