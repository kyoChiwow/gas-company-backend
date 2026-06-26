import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { OtpRoutes } from "../modules/otp/otp.route";
import { SectionRoutes } from "../modules/section/section.route";
import { TypeRoutes } from "../modules/type/type.route";
import { UserRoutes } from "../modules/user/user.route";

export const router = Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/otp",
    route: OtpRoutes,
  },
  {
    path: "/section",
    route: SectionRoutes,
  },
  {
    path: "/type",
    route: TypeRoutes,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
