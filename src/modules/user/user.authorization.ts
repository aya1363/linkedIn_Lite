import { RoleEnum } from "src/common";

export const endPoint = {
  create: [RoleEnum.admin, RoleEnum.superAdmin],
  all: [RoleEnum.admin, RoleEnum.superAdmin,RoleEnum.user],
};