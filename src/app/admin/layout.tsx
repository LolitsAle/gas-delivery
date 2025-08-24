import Header from "@/components/admin/Header";
import Sidebar from "@/components/admin/Sidebar";
import React from "react";

interface Props {
  children: React.ReactNode;
}

function Layout(props: Props) {
  const { children } = props;

  return (
    <div className="flex overflow-hidden h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-auto">
        <div className="max-w-7x1 mx-auto w-full">
          <Header />
          {children}
        </div>
      </div>
    </div>
  );
}

export default Layout;
