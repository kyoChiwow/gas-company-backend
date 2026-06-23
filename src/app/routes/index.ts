import { Router } from "express";

const router = Router();

const moduleRoutes = [
    {
        path: "/auth"
    }
];

moduleRoutes.forEach((route) => {
    router.use(route.path, route.router);
});