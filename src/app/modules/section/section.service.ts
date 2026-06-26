import httpStatus from "http-status-codes";
import slugify from "slugify";
import AppError from "../../errorHelpers/appError";
import { QueryBuilder } from "../../utils/queryBuilder";
import { ISection } from "./section.interface";
import { Section } from "./section.model";

const createSectionService = async (payload: ISection) => {
  const slug = slugify(payload.name, {
    lower: true,
    strict: true,
    trim: true,
  });

  const isSectionExists = await Section.findOne({
    $or: [
      { name: payload.name },
      { slug },
    ],
  });

  if (isSectionExists) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Section already exists!"
    );
  }

  const section = await Section.create({
    ...payload,
    slug,
  });

  return section;
};

const getAllSectionsService = async (
  query: Record<string, string>,
) => {
  const queryBuilder = new QueryBuilder(
    Section.find(),
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

const getSingleSectionService = async (id: string) => {
  const section = await Section.findById(id);

  if (!section) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Section not found!"
    );
  }

  return section;
};

const updateSectionService = async (
  id: string,
  payload: Partial<ISection>,
) => {
  const section = await Section.findById(id);

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

    const exists = await Section.findOne({
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

  const updatedSection = await Section.findByIdAndUpdate(
    id,
    payload,
    {
      new: true,
      runValidators: true,
    },
  );

  return updatedSection;
};

const deleteSectionService = async (id: string) => {
  const section = await Section.findById(id);

  if (!section) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Section not found!"
    );
  }

  await Section.findByIdAndDelete(id);

  return null;
};

export const SectionServices = {
  createSectionService,
  getAllSectionsService,
  getSingleSectionService,
  updateSectionService,
  deleteSectionService,
};