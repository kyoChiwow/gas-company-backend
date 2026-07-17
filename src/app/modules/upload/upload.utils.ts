/* eslint-disable @typescript-eslint/no-unused-vars */
export const getPublicIdFromUrl = (url: string): string | null => {
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;

    const publicIdWithExt = parts[1].replace(/^v\d+\//, "");
    const publicId = publicIdWithExt.substring(
      0,
      publicIdWithExt.lastIndexOf("."),
    );

    return publicId;
  } catch (error) {
    return null;
  }
};
