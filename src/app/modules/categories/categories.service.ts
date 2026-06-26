import httpStatus from 'http-status-codes';
import slugify from 'slugify';
import { Categories } from './categories.model';
import AppError from '../../errorHelpers/appError';
import { ICategories } from './categories.interface';
import { QueryBuilder } from '../../utils/queryBuilder';

const createCategoriesService = async (payload: ICategories) => {
  const slug = slugify(payload.name, {
    lower: true,
    strict: true,
    trim: true,
  });

  const isCategoriesExists = await Categories.findOne({
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

  const section = await Categories.create({
    ...payload,
    slug,
  });

  return section;
};

const getAllCategoriesService = async (
  query: Record<string, string>,
) => {
  const queryBuilder = new QueryBuilder(
    Categories.find(),
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

const getSingleCategoriesService = async (id: string) => {
  const section = await Categories.findById(id);

  if (!section) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Section not found!"
    );
  }

  return section;
};

const updateCategoriesService = async (
  id: string,
  payload: Partial<ICategories>,
) => {
  const section = await Categories.findById(id);

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

    const exists = await Categories.findOne({
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

  const updatedSection = await Categories.findByIdAndUpdate(
    id,
    payload,
    {
      new: true,
      runValidators: true,
    },
  );

  return updatedSection;
};

const deleteCategoriesService = async (id: string) => {
  const section = await Categories.findById(id);

  if (!section) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Section not found!"
    );
  }

  await Categories.findByIdAndDelete(id);

  return null;
};

export const CategoriesServices = {
  createCategoriesService,
  getAllCategoriesService,
  getSingleCategoriesService,
  updateCategoriesService,
  deleteCategoriesService,
};