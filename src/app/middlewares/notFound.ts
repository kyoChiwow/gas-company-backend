import httpStatus from 'http-status-codes';
import { Request, Response } from "express"

const notFound = (req: Request, res: Response) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "Not Found",
  })
}

export default notFound;