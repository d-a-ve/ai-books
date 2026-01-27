import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  
  layout("routes/library.tsx", [
    route("library", "routes/library._index.tsx"),
    route("library/:type", "routes/library.$type.tsx"),
  ]),
  
  route("content/:id", "routes/content.$id.tsx"),
  
  route("admin/login", "routes/admin.login.tsx"),
  route("admin/logout", "routes/admin.logout.tsx"),
  
  layout("routes/admin.tsx", [
    route("admin", "routes/admin._index.tsx"),
    route("admin/upload", "routes/admin.upload.tsx"),
    route("admin/manage", "routes/admin.manage.tsx"),
    route("admin/edit/:id", "routes/admin.edit.$id.tsx"),
    route("admin/delete/:id", "routes/admin.delete.$id.tsx"),
  ]),
] satisfies RouteConfig;
