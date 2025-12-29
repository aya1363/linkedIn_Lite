import type { NextFunction, Request, Response } from "express"

//export const PreAuth = (req:Request ,res:Response,next:NextFunction) => {
  //  if (!(req.headers.authorization?.split(' ')?.length==2)) {
 //       throw new BadRequestException('missing authorization key')
 //   }

 //   next()
//}

export const PreAuth = (req: Request, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;

  if (!auth || auth.split(' ').length !== 2) {
    return res.status(400).json({
      message: 'missing authorization key',
    });
  }

  next();
};



