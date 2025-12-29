import { RoleEnum } from "src/common";

export const endPoint = {
    create: [RoleEnum.user],
    approve:[RoleEnum.admin, RoleEnum.superAdmin]
}