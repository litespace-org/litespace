const Layout: React.FC<
  Readonly<{
    children: React.ReactNode;
  }>
> = ({ children }) => {
  return <main className="w-full max-w-screen-3xl mx-auto">{children}</main>;
};

export default Layout;
