import { CONTACT_PHONES } from "@/constants/constants";
import { PhoneCall } from "lucide-react";
import React, { useState } from "react";

const PhoneCallPopup = () => {
  const [openPhoneCall, setOpenPhoneCall] = useState(false);
  return (
    <>
      {openPhoneCall && (
        <div
          className="fixed inset-0 z-40 bg-black/0"
          onClick={() => setOpenPhoneCall(false)}
        />
      )}
      <div className="fixed bottom-[30vw] right-[5vw] z-50 flex flex-col justify-center text-[2vw] items-end">
        {openPhoneCall && (
          <div className="mb-3 w-fit max-w-xs rounded-xl p-[5vw] flex flex-col gap-[2vw] bg-black shadow-xl border overflow-hidden animate-in fade-in slide-in-from-bottom-2">
            {CONTACT_PHONES.map((phone) => (
              <a
                key={phone.name}
                href={`tel:${phone.call}`}
                className="block text-[5vw] font-medium text-white hover:bg-gas-gray-600 active:bg-gas-gray-600"
              >
                📞: {phone.name}
              </a>
            ))}
          </div>
        )}
        <button
          onClick={() => setOpenPhoneCall((prev) => !prev)}
          className="bg-red-600 p-[3vw] rounded-full shadow-lg active:scale-95 transition"
        >
          <PhoneCall size="8vw" className="text-white" />
        </button>
      </div>
    </>
  );
};

export default PhoneCallPopup;
