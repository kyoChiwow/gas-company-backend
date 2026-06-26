import httpStatus from 'http-status-codes';
import slugify from 'slugify';
import { IBrand } from './brand.interface';
import { Brand } from './brand.model';
import AppError from '../../errorHelpers/appError';
import { QueryBuilder } from '../../utils/queryBuilder';

const createBrandService = async (payload: IBrand) => {
  const slug = slugify(payload.name, {
    lower: true,
    strict: true,
    trim: true,
  });

  const isCategoriesExists = await Brand.findOne({
    $or: [
      { name: payload.name },
      { slug },
    ],
  });

  if (isCategoriesExists) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Section already exists!"
    );
  }

  const section = await Brand.create({
    ...payload,
    slug,
  });

  return section;
};

const getAllBrandService = async (
  query: Record<string, string>,
) => {
  const queryBuilder = new QueryBuilder(
    Brand.find(),
    query,
  );

  const sections = queryBuilder
    .search(["name", "description"])
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    sections.build(),
    sections.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

const getSingleBrandService = async (id: string) => {
  const section = await Brand.findById(id);

  if (!section) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Section not found!"
    );
  }

  return section;
};

const updateBrandService = async (
  id: string,
  payload: Partial<IBrand>,
) => {
  const section = await Brand.findById(id);

  if (!section) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Section not found!"
    );
  }

  if (payload.name) {
    payload.slug = slugify(payload.name, {
      lower: true,
      strict: true,
      trim: true,
    });

    const exists = await Brand.findOne({
      _id: { $ne: id },
      $or: [
        { name: payload.name },
        { slug: payload.slug },
      ],
    });

    if (exists) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Section already exists!"
      );
    }
  }

  const updatedSection = await Brand.findByIdAndUpdate(
    id,
    payload,
    {
      new: true,
      runValidators: true,
    },
  );

  return updatedSection;
};

const deleteBrandService = async (id: string) => {
  const section = await Brand.findById(id);

  if (!section) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Section not found!"
    );
  }

  await Brand.findByIdAndDelete(id);

  return null;
};

export const BrandServices = {
  createBrandService,
  getAllBrandService,
  getSingleBrandService,
  updateBrandService,
  deleteBrandService,
};