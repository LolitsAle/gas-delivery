import { CONTACT_PHONES } from "@/constants/constants";
import React from "react";

const PhoneCall = () => {
  return (
    <div className="mt-[5vw] px-[6vw]">
      <div className="flex flex-col items-center bg-white rounded-2xl p-[4vw] shadow-md text-black border-2 border-red-400">
        <div className="font-semibold text-[3.8vw] mb-[1vw]">
          Gặp rắc rối khi dùng ứng dụng?
        </div>

        <div className="text-gray-700 text-[3.5vw] mb-[3vw]">
          Bấm vào số hotline bên dưới để được hỗ trợ.
        </div>

        <div className="grid grid-cols-2 gap-[3vw] w-full">
          {CONTACT_PHONES.map((phone) => (
            <a
              key={phone.name}
              href={`tel:${phone.call}`}
              className="flex flex-col items-center justify-center 
                     bg-red-400 text-white
                     py-[1vw] rounded-xl 
                     active:scale-95 transition text-center"
            >
              <span className="text-[4vw] font-medium flex justify-center items-center">
                {phone.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PhoneCall;
