import Image from "next/image";
import React from "react";
import VietNameseFlag from "@/assets/icons/vietnam-flag.png";
import DefaultUserIcon from "@/assets/icons/default-profile.png";
import { Bell } from "lucide-react";

interface Props {}

function Header(props: Props) {
  const {} = props;

  return (
    <header className="bg-[#1e1e1e] shadow-lg border-b border-[#1f1f1f] mx-4 sm: mx-6 lg:mx-8 mt-4 mb-2 rounded-lg">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 flex items-center justify-between ">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-100">
          Dashboard
        </h1>

        <div className="flex items-center space-x-3 sm:space-x-6">
          <Image
            src={VietNameseFlag}
            alt="country flag"
            width={25}
            height={18}
            className="rounded-full shadow-md cursor-pointer bg-white"
          />
          <div className="relative">
            <Bell className="w-5 sm:w-6 h-5 sm:h-6 text-gray-300 cursor-pointer hover:text-white" />
          </div>
          <div className="flex items-center square-x-2 sm:space-x-3">
            <Image
              src={DefaultUserIcon}
              alt="admin"
              width={35}
              height={35}
              className="rounded-full border border-gray-600"
            ></Image>
            <div className="hidden sm:block text-gray-100 font-medium"> Ngo Thanh Son</div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
