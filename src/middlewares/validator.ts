import { AnySchema, ValidationError } from "yup";
import { Request, Response, NextFunction } from "express";
const validator =
  (schema: AnySchema, field: "query" | "params" | "body" = "body") =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await schema.validate(req[field], {stripUnknown: true, abortEarly: true});
      req[field] = data;
      next();
    } catch (error) {
      const errors = (error as ValidationError).errors;
      return res.status(400).json({
        message: errors[0],
        errors,
      });
    }
  };

export default validator;
