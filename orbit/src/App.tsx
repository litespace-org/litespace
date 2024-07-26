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
import { MyInterviewList, MyInterviewShow } from "@/pages/my-interviews";
import { UserList, UserCreate, UserEdit, UserShow } from "@/pages/users";
import { TutorCreate, TutorEdit, TutorList, TutorShow } from "@/pages/tutors";
import {
  TutorMediaEdit,
  TutorMediaList,
  TutorMediaShow,
} from "@/pages/tutorsMedia";
import { PlanCreate, PlanEdit, PlanList, PlanShow } from "@/pages/plans";
import {
  CouponCreate,
  CouponEdit,
  CouponList,
  CouponShow,
} from "@/pages/coupons";
import {
  InviteCreate,
  InviteEdit,
  InviteList,
  InviteShow,
} from "@/pages/invites";
import {
  ReportCreate,
  ReportEdit,
  ReportList,
  ReportShow,
} from "@/pages/reports";
import {
  MyScheduleCreate,
  MyScheduleEdit,
  MyScheduleList,
  MyScheduleShow,
} from "@/pages/my-schedule";
import { ColorModeContextProvider } from "@/contexts/color-mode";
import { Header } from "@/components/header";
import { Login } from "@/pages/login";
import { ForgotPassword, ResetPassword } from "@/pages/password";
import { authProvider } from "@/providers/auth";
import { accessControlProvider } from "@/providers/access";

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <AntdApp>
            <DevtoolsProvider>
              <Refine
                dataProvider={dataProvider}
                accessControlProvider={accessControlProvider}
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
                    name: Resource.TutorsMedia,
                    list: "/tutors-media",
                    edit: "/tutors-media/edit/:id",
                    show: "/tutors-media/show/:id",
                    meta: { canDelete: true, label: "Tutors Media" },
                  },
                  {
                    name: Resource.Plans,
                    list: "/plans",
                    create: "/plans/create",
                    edit: "/plans/edit/:id",
                    show: "/plans/show/:id",
                    meta: { canDelete: true, label: "Plans" },
                  },
                  {
                    name: Resource.Coupons,
                    list: "/coupons",
                    create: "/coupons/create",
                    edit: "/coupons/edit/:id",
                    show: "/coupons/show/:id",
                    meta: { canDelete: true, label: "Coupons" },
                  },
                  {
                    name: Resource.Invites,
                    list: "/invites",
                    create: "/invites/create",
                    edit: "/invites/edit/:id",
                    show: "/invites/show/:id",
                    meta: { canDelete: true, label: "Invites" },
                  },
                  {
                    name: Resource.Reports,
                    list: "/reports",
                    create: "/reports/create",
                    edit: "/reports/edit/:id",
                    show: "/reports/show/:id",
                    meta: { canDelete: true, label: "Reports" },
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
                    name: Resource.MyInterviews,
                    list: "/my-interviews",
                    show: "/my-interviews/show/:id",
                    meta: { canDelete: true, label: "My Interviews" },
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
                    <Route path="/tutors-media">
                      <Route index element={<TutorMediaList />} />
                      <Route path="edit/:id" element={<TutorMediaEdit />} />
                      <Route path="show/:id" element={<TutorMediaShow />} />
                    </Route>
                    <Route path="/plans">
                      <Route index element={<PlanList />} />
                      <Route path="create" element={<PlanCreate />} />
                      <Route path="edit/:id" element={<PlanEdit />} />
                      <Route path="show/:id" element={<PlanShow />} />
                    </Route>
                    <Route path="/coupons">
                      <Route index element={<CouponList />} />
                      <Route path="create" element={<CouponCreate />} />
                      <Route path="edit/:id" element={<CouponEdit />} />
                      <Route path="show/:id" element={<CouponShow />} />
                    </Route>
                    <Route path="/invites">
                      <Route index element={<InviteList />} />
                      <Route path="create" element={<InviteCreate />} />
                      <Route path="edit/:id" element={<InviteEdit />} />
                      <Route path="show/:id" element={<InviteShow />} />
                    </Route>
                    <Route path="/reports">
                      <Route index element={<ReportList />} />
                      <Route path="create" element={<ReportCreate />} />
                      <Route path="edit/:id" element={<ReportEdit />} />
                      <Route path="show/:id" element={<ReportShow />} />
                    </Route>
                    <Route path="/my-schedule">
                      <Route index element={<MyScheduleList />} />
                      <Route path="create" element={<MyScheduleCreate />} />
                      <Route path="edit/:id" element={<MyScheduleEdit />} />
                      <Route path="show/:id" element={<MyScheduleShow />} />
                    </Route>
                    <Route path="/my-interviews">
                      <Route index element={<MyInterviewList />} />
                      <Route path="show/:id" element={<MyInterviewShow />} />
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
                    <Route path="/reset-password" element={<ResetPassword />} />
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
