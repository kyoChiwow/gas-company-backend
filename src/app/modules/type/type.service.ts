import slugify from 'slugify';
import httpStatus from 'http-status-codes';
import AppError from "../../errorHelpers/appError";
import { Type } from "./type.model";
import { QueryBuilder } from '../../utils/queryBuilder';
import { IType } from './type.interface';

const createTypeService = async (payload: IType) => {
  const slug = slugify(payload.name, {
    lower: true,
    strict: true,
    trim: true,
  });

  const isTypeExists = await Type.findOne({
    $or: [
      { name: payload.name },
      { slug },
    ],
  });

  if (isTypeExists) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Section already exists!"
    );
  }

  const section = await Type.create({
    ...payload,
    slug,
  });

  return section;
};

const getAllTypeService = async (
  query: Record<string, string>,
) => {
  const queryBuilder = new QueryBuilder(
    Type.find(),
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

const getSingleTypeService = async (id: string) => {
  const section = await Type.findById(id);

  if (!section) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Section not found!"
    );
  }

  return section;
};

const updateTypeService = async (
  id: string,
  payload: Partial<IType>,
) => {
  const section = await Type.findById(id);

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

    const exists = await Type.findOne({
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

  const updatedSection = await Type.findByIdAndUpdate(
    id,
    payload,
    {
      new: true,
      runValidators: true,
    },
  );

  return updatedSection;
};

const deleteTypeService = async (id: string) => {
  const section = await Type.findById(id);

  if (!section) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Section not found!"
    );
  }

  await Type.findByIdAndDelete(id);

  return null;
};

export const TypeServices = {
  createTypeService,
  getAllTypeService,
  getSingleTypeService,
  updateTypeService,
  deleteTypeService,
};