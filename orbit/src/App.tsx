import { Refine, Authenticated } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { RocketFilled } from "@ant-design/icons";

import {
  ErrorComponent,
  useNotificationProvider,
  ThemedLayoutV2,
  ThemedSiderV2,
  ThemedTitleV2,
} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";

import { Resource, dataProvider } from "@/providers/data";
import { App as AntdApp } from "antd";
import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";
import routerBindings, {
  NavigateToResource,
  CatchAllNavigate,
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router-v6";
import { UserList, UserCreate, UserEdit, UserShow } from "./pages/users";
import { TutorCreate, TutorEdit, TutorList, TutorShow } from "./pages/tutors";
import {
  ZoomAccountCreate,
  ZoomAccountEdit,
  ZoomAccountList,
  ZoomAccountShow,
} from "@/pages/zoom-accounts";
import {
  MyScheduleCreate,
  MyScheduleEdit,
  MyScheduleList,
  MyScheduleShow,
} from "@/pages/my-schedule";
import {
  BlogPostList,
  BlogPostCreate,
  BlogPostEdit,
  BlogPostShow,
} from "@/pages/blog-posts";
import {
  CategoryList,
  CategoryCreate,
  CategoryEdit,
  CategoryShow,
} from "@/pages/categories";
import { ColorModeContextProvider } from "./contexts/color-mode";
import { Header } from "./components/header";
import { Login } from "./pages/login";
import { ForgotPassword } from "./pages/forgotPassword";
import { authProvider } from "./providers/auth";

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <AntdApp>
            <DevtoolsProvider>
              <Refine
                dataProvider={dataProvider}
                notificationProvider={useNotificationProvider}
                routerProvider={routerBindings}
                authProvider={authProvider}
                resources={[
                  {
                    name: Resource.Users,
                    list: "/users",
                    create: "/users/create",
                    edit: "/users/edit/:id",
                    show: "/users/show/:id",
                    meta: { canDelete: true, label: "Users" },
                  },
                  {
                    name: Resource.Tutors,
                    list: "/tutors",
                    create: "/tutors/create",
                    edit: "/tutors/edit/:id",
                    show: "/tutors/show/:id",
                    meta: { canDelete: true, label: "Tutors" },
                  },
                  {
                    name: Resource.MySchedule,
                    list: "/my-schedule",
                    create: "/my-schedule/create",
                    edit: "/my-schedule/edit/:id",
                    show: "/my-schedule/show/:id",
                    meta: { canDelete: true, label: "My Schedule" },
                  },
                  {
                    name: Resource.ZoomAccounts,
                    list: "/zoom-accounts",
                    create: "/zoom-accounts/create",
                    edit: "/zoom-accounts/edit/:id",
                    show: "/zoom-accounts/show/:id",
                    meta: { canDelete: true, label: "Zoom Account" },
                  },
                  {
                    name: "blog_posts",
                    list: "/blog-posts",
                    create: "/blog-posts/create",
                    edit: "/blog-posts/edit/:id",
                    show: "/blog-posts/show/:id",
                    meta: { canDelete: true },
                  },
                  {
                    name: "categories",
                    list: "/categories",
                    create: "/categories/create",
                    edit: "/categories/edit/:id",
                    show: "/categories/show/:id",
                    meta: { canDelete: true },
                  },
                ]}
                options={{
                  syncWithLocation: true,
                  warnWhenUnsavedChanges: true,
                  useNewQueryKeys: true,
                }}
              >
                <Routes>
                  <Route
                    element={
                      <Authenticated
                        key="authenticated-inner"
                        fallback={<CatchAllNavigate to="/login" />}
                      >
                        <ThemedLayoutV2
                          Title={({ collapsed }) => (
                            <ThemedTitleV2
                              collapsed={collapsed}
                              text="LiteSpace"
                              icon={
                                <RocketFilled style={{ fontSize: "22px" }} />
                              }
                            />
                          )}
                          Header={() => <Header sticky />}
                          Sider={(props) => <ThemedSiderV2 {...props} fixed />}
                        >
                          <Outlet />
                        </ThemedLayoutV2>
                      </Authenticated>
                    }
                  >
                    <Route
                      index
                      element={<NavigateToResource resource="users" />}
                    />
                    <Route path="/users">
                      <Route index element={<UserList />} />
                      <Route path="create" element={<UserCreate />} />
                      <Route path="edit/:id" element={<UserEdit />} />
                      <Route path="show/:id" element={<UserShow />} />
                    </Route>
                    <Route path="/tutors">
                      <Route index element={<TutorList />} />
                      <Route path="create" element={<TutorCreate />} />
                      <Route path="edit/:id" element={<TutorEdit />} />
                      <Route path="show/:id" element={<TutorShow />} />
                    </Route>
                    <Route path="/my-schedule">
                      <Route index element={<MyScheduleList />} />
                      <Route path="create" element={<MyScheduleCreate />} />
                      <Route path="edit/:id" element={<MyScheduleEdit />} />
                      <Route path="show/:id" element={<MyScheduleShow />} />
                    </Route>
                    <Route path="/zoom-accounts">
                      <Route index element={<ZoomAccountList />} />
                      <Route path="create" element={<ZoomAccountCreate />} />
                      <Route path="edit/:id" element={<ZoomAccountEdit />} />
                      <Route path="show/:id" element={<ZoomAccountShow />} />
                    </Route>
                    <Route path="/blog-posts">
                      <Route index element={<BlogPostList />} />
                      <Route path="create" element={<BlogPostCreate />} />
                      <Route path="edit/:id" element={<BlogPostEdit />} />
                      <Route path="show/:id" element={<BlogPostShow />} />
                    </Route>
                    <Route path="/categories">
                      <Route index element={<CategoryList />} />
                      <Route path="create" element={<CategoryCreate />} />
                      <Route path="edit/:id" element={<CategoryEdit />} />
                      <Route path="show/:id" element={<CategoryShow />} />
                    </Route>
                    <Route path="*" element={<ErrorComponent />} />
                  </Route>
                  <Route
                    element={
                      <Authenticated
                        key="authenticated-outer"
                        fallback={<Outlet />}
                      >
                        <NavigateToResource />
                      </Authenticated>
                    }
                  >
                    <Route path="/login" element={<Login />} />
                    <Route
                      path="/forgot-password"
                      element={<ForgotPassword />}
                    />
                  </Route>
                </Routes>

                <RefineKbar />
                <UnsavedChangesNotifier />
                <DocumentTitleHandler />
              </Refine>
              <DevtoolsPanel />
            </DevtoolsProvider>
          </AntdApp>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
