import type { NextFunction, Request, Response } from "express";
import type { AnyZodObject, ZodIssue, infer as zodInfer } from "zod";

const formatZodIssue = (issue: ZodIssue): string => {
  const { message } = issue;

  return message;
};

const formatZodError = (error: unknown) => {
  const { issues } = error as typeof error & { issues: ZodIssue[] };

  if (issues.length) {
    const currentIssue = issues[0];

    return formatZodIssue(currentIssue);
  }
  return;
};
export const validateDTO =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      return res.status(400).json({
        message: formatZodError(error),
        status: 400,
        success: false,
      });
    }
  };

export type InferZodSchemaTypes<T extends AnyZodObject> = zodInfer<T>;
