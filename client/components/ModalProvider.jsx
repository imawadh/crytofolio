"use client";

import { createContext, useContext, useState } from "react";
import LoginModal from "./LoginModal";
import Signup from "./Signup";

const ModalContext = createContext({ open: [() => {}, () => {}] });

export const useModal = () => useContext(ModalContext);

export default function ModalProvider({ children }) {
  const [openLogin, setOpenLogin] = useState(false);
  const [openSignup, setOpenSignup] = useState(false);

  // Keep the historical [setLogin, setSignup] tuple shape so the modal
  // components can be reused with minimal changes.
  const open = [setOpenLogin, setOpenSignup];

  return (
    <ModalContext.Provider value={{ open }}>
      {openLogin && <LoginModal closemod={open} />}
      {openSignup && <Signup closemod={open} />}
      {children}
    </ModalContext.Provider>
  );
}
