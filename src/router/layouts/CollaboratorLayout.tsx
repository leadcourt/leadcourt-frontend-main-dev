import { Navigate, Outlet } from "react-router-dom";
import { useRecoilValue } from "recoil";
import {
  accessTokenState,
  refreshTokenState,
  userState,
} from "../../utils/atom/authAtom";
import { useState } from "react";
import ScrollButtons from "../../component/ScrollButtons";
import CollaboratorSidebar from "../../component/collaborator/CollaboratorSidebar";
import CollaboratorTopbar from "../../component/collaborator/CollaboratorTopbar";

export default function CollaboratorLayout() {
  const accessToken = useRecoilValue(accessTokenState);
  const refreshToken = useRecoilValue(refreshTokenState);
  const user = useRecoilValue(userState);
  const [sideBar, setSideBar] = useState(false);

  const [displaySide, setDisplaySide] = useState(false);

  const handleSideBar = () => {
    setDisplaySide(!displaySide);
  };

  const updateSidebarFromChild = (childData: boolean) => {
    setSideBar(childData);
  };

  const auth = {
    access: accessToken,
    token: refreshToken,
  };

  return (
    <div>
      {auth?.access && user?.email !== null ? (
        <div className="">
          <div className="fixed wfit z-50 bottom-5 right-5 ">
            <ScrollButtons />
          </div>
          <div className="relative lg:grid grid-cols-[200px,1fr] ">
            <div
              className={`${
                displaySide ? "fixed" : "hidden"
              } shadow-2xl lg:shadow-none w-fit h-[90vh] lg:h-[100vh] bg-white z-50 lg:block`}
            >
              <CollaboratorSidebar updateBar={updateSidebarFromChild} />
            </div>
            <div className="">
              <div
                className={`top-0 right-0 fixed w-full  ${
                  sideBar ? "lg:w-[calc(100%-200px)]" : "lg:w-[calc(100%-80px)]"
                }  z-40`}
              >
                <div className="relative border-b-gray-100 border-b items-center justify-between flex bg-white ">
                  <CollaboratorTopbar />
                  <div className="lg:hidden">
                    {displaySide ? (
                      <i
                        onClick={handleSideBar}
                        className="absolute top-1/2 -translate-y-1/2 right-5 text-black text-2xl pi pi-times "
                      ></i>
                    ) : (
                      <i
                        onClick={handleSideBar}
                        className="absolute top-1/2 -translate-y-1/2 right-5 text-black text-4xl pi pi-bars "
                      ></i>
                    )}
                  </div>
                </div>
              </div>
              <div
                className={`mt-[10vh] w-full ${
                  sideBar ? "lg:w-[calc(100%-200px)]" : "lg:w-[calc(100%-80px)]"
                } absolute top-0 right-0 min-h-50`}
              >
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="">
          <Navigate to="/" />
        </div>
      )}
    </div>
  );
}
